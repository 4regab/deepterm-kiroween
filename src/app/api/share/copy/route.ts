import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/config/supabase/server'

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

const DAILY_COPY_LIMIT = 20

async function checkCopyRateLimit(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>, userId: string): Promise<{ allowed: boolean; remaining: number }> {
  const today = new Date().toISOString().split('T')[0]
  
  // Count copies made today by checking materials created with " (Copy)" suffix
  const { count: flashcardCopies } = await supabase
    .from('flashcard_sets')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .like('title', '% (Copy)')
    .gte('created_at', `${today}T00:00:00Z`)
  
  const { count: reviewerCopies } = await supabase
    .from('reviewers')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .like('title', '% (Copy)')
    .gte('created_at', `${today}T00:00:00Z`)
  
  const totalCopies = (flashcardCopies || 0) + (reviewerCopies || 0)
  const remaining = Math.max(0, DAILY_COPY_LIMIT - totalCopies)
  
  return { allowed: totalCopies < DAILY_COPY_LIMIT, remaining }
}

// POST - Copy shared material to user's collection
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rateLimit = await checkCopyRateLimit(supabase, user.id)
  if (!rateLimit.allowed) {
    return NextResponse.json({ 
      error: `Daily copy limit reached (${DAILY_COPY_LIMIT}/day)`,
      remaining: rateLimit.remaining
    }, { status: 429 })
  }

  let shareCode: string
  try {
    const body = await request.json()
    shareCode = body.shareCode
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
  
  if (!shareCode || typeof shareCode !== 'string') {
    return NextResponse.json({ error: 'Missing shareCode' }, { status: 400 })
  }
  
  // Validate shareCode format to prevent injection
  if (!/^[a-zA-Z0-9-]+$/.test(shareCode) || shareCode.length > 50) {
    return NextResponse.json({ error: 'Invalid shareCode format' }, { status: 400 })
  }

  // Get shared material data using the RPC function
  const { data: sharedData, error: fetchError } = await supabase
    .rpc('get_shared_material', { p_share_code: shareCode })

  if (fetchError || !sharedData) {
    return NextResponse.json({ error: 'Shared material not found' }, { status: 404 })
  }

  try {
    if (sharedData.type === 'flashcard_set') {
      // Copy flashcard set
      const { data: newSet, error: setError } = await supabase
        .from('flashcard_sets')
        .insert({
          user_id: user.id,
          title: `${sharedData.material.title} (Copy)`,
          color: '#E0F2FE',
        })
        .select()
        .single()

      if (setError || !newSet) {
        throw new Error('Failed to create flashcard set')
      }

      // Copy flashcards
      if (sharedData.items && sharedData.items.length > 0) {
        const flashcardsToInsert = sharedData.items.map((item: { front: string; back: string }) => ({
          set_id: newSet.id,
          user_id: user.id,
          front: item.front,
          back: item.back,
          status: 'new',
        }))

        const { error: cardsError } = await supabase
          .from('flashcards')
          .insert(flashcardsToInsert)

        if (cardsError) {
          // Rollback: delete the set
          await supabase.from('flashcard_sets').delete().eq('id', newSet.id)
          throw new Error('Failed to copy flashcards')
        }
      }

      // Update user stats
      await supabase.rpc('increment_stat', { p_stat_name: 'flashcard_sets_created', p_amount: 1 })

      return NextResponse.json({ 
        success: true, 
        materialId: newSet.id,
        materialType: 'flashcard_set',
        redirectUrl: `/materials/${newSet.id}`
      })

    } else if (sharedData.type === 'reviewer') {
      // Copy reviewer
      const { data: newReviewer, error: reviewerError } = await supabase
        .from('reviewers')
        .insert({
          user_id: user.id,
          title: `${sharedData.material.title} (Copy)`,
          extraction_mode: sharedData.material.extraction_mode || 'full',
        })
        .select()
        .single()

      if (reviewerError || !newReviewer) {
        throw new Error('Failed to create reviewer')
      }

      // Copy categories and terms
      if (sharedData.categories && sharedData.categories.length > 0) {
        for (const category of sharedData.categories) {
          const { data: newCategory, error: catError } = await supabase
            .from('reviewer_categories')
            .insert({
              reviewer_id: newReviewer.id,
              user_id: user.id,
              name: category.name,
              color: category.color,
            })
            .select()
            .single()

          if (catError || !newCategory) {
            // Rollback
            await supabase.from('reviewers').delete().eq('id', newReviewer.id)
            throw new Error('Failed to copy categories')
          }

          // Copy terms for this category
          if (category.terms && category.terms.length > 0) {
            const termsToInsert = category.terms.map((term: { 
              term: string
              definition: string
              examples: string[] | null
              keywords: string[] | null 
            }) => ({
              category_id: newCategory.id,
              user_id: user.id,
              term: term.term,
              definition: term.definition,
              examples: term.examples || [],
              keywords: term.keywords || [],
            }))

            const { error: termsError } = await supabase
              .from('reviewer_terms')
              .insert(termsToInsert)

            if (termsError) {
              // Rollback
              await supabase.from('reviewers').delete().eq('id', newReviewer.id)
              throw new Error('Failed to copy terms')
            }
          }
        }
      }

      // Update user stats
      await supabase.rpc('increment_stat', { p_stat_name: 'reviewers_created', p_amount: 1 })

      return NextResponse.json({ 
        success: true, 
        materialId: newReviewer.id,
        materialType: 'reviewer',
        redirectUrl: `/materials/${newReviewer.id}`
      })
    }

    return NextResponse.json({ error: 'Unknown material type' }, { status: 400 })

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Copy failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
