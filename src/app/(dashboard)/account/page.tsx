"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/config/supabase/client";
import { User, Mail, Trash2 } from "lucide-react";
import { useThemeStore } from "@/lib/stores";

interface Profile {
    id: string;
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
}

async function fetchAccountProfile(): Promise<{ profile: Profile | null; fullName: string }> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return { profile: null, fullName: "" };

    const { data } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url")
        .eq("id", user.id)
        .single();
    
    const googleIdentity = user.identities?.find(i => i.provider === "google");
    const identityData = googleIdentity?.identity_data;
    
    const avatarUrl = 
        data?.avatar_url || 
        user.user_metadata?.avatar_url || 
        user.user_metadata?.picture ||
        identityData?.avatar_url ||
        identityData?.picture;
    
    const fullName = 
        data?.full_name || 
        user.user_metadata?.full_name || 
        user.user_metadata?.name ||
        identityData?.full_name ||
        identityData?.name;
    
    const email = data?.email || user.email;
    
    return {
        profile: {
            id: user.id,
            full_name: fullName || null,
            email: email || null,
            avatar_url: avatarUrl || null
        },
        fullName: fullName || ""
    };
}

export default function AccountPage() {
    const theme = useThemeStore((state) => state.theme);
    const isSpooky = theme === "spooky";
    const [profile, setProfile] = useState<Profile | null>(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [formData, setFormData] = useState({ full_name: "" });
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [loading, setLoading] = useState(true);
    const fetchTriggered = useState(() => {
        fetchAccountProfile().then(({ profile, fullName }) => {
            setProfile(profile);
            setFormData({ full_name: fullName });
            setLoading(false);
        });
        return true;
    })[0];
    void fetchTriggered;

    const handleSave = async () => {
        if (!profile) return;
        setSaving(true);
        setMessage(null);

        const supabase = createClient();
        const { error } = await supabase
            .from("profiles")
            .update({ full_name: formData.full_name })
            .eq("id", profile.id);

        if (error) {
            setMessage({ type: "error", text: "Failed to update profile" });
        } else {
            setProfile({ ...profile, full_name: formData.full_name });
            setMessage({ type: "success", text: "Profile updated successfully" });
        }
        setSaving(false);
    };

    const handleDeleteAccount = async () => {
        setDeleting(true);
        setMessage(null);
        
        const supabase = createClient();
        const { error } = await supabase.rpc("delete_user");
        
        if (error) {
            setMessage({ type: "error", text: "Failed to delete account. Please try again." });
            setDeleting(false);
            setShowDeleteConfirm(false);
        } else {
            await supabase.auth.signOut();
            window.location.href = "/";
        }
    };

    const getInitials = (name: string | null) => {
        if (!name) return "?";
        return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className={`w-8 h-8 border-2 border-t-transparent rounded-full animate-spin ${isSpooky ? "border-purple-500" : "border-[#171d2b]"}`} />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <header className="mb-8">
                <h1 className={`font-serif text-[32px] sm:text-[40px] mb-2 ${isSpooky ? "text-purple-100" : "text-[#171d2b]"}`}>
                    {isSpooky ? "Soul Settings" : "Account Settings"}
                </h1>
                <p className={`font-sans text-[16px] ${isSpooky ? "text-purple-300/60" : "text-[#171d2b]/60"}`}>
                    {isSpooky ? "Configure your dark presence" : "Manage your profile and preferences"}
                </p>
            </header>

            <div className="max-w-2xl">
                <div className={`rounded-2xl border p-6 mb-6 ${isSpooky ? "bg-[#151821] border-purple-500/20" : "bg-white border-[#171d2b]/10"}`}>
                    <h2 className={`font-serif text-[20px] mb-6 ${isSpooky ? "text-purple-100" : "text-[#171d2b]"}`}>{isSpooky ? "Vessel" : "Profile"}</h2>
                    
                    <div className="flex items-center gap-6 mb-6">
                        {profile?.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={profile.avatar_url}
                                alt="Profile"
                                className={`w-20 h-20 rounded-full object-cover ${isSpooky ? "ring-2 ring-purple-500/30" : ""}`}
                            />
                        ) : (
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-sora text-xl ${isSpooky ? "bg-gradient-to-br from-purple-600 to-purple-900" : "bg-gradient-to-br from-[#171d2b] to-[#2a3347]"}`}>
                                {getInitials(profile?.full_name ?? null)}
                            </div>
                        )}
                        <div>
                            <p className={`font-sans text-[16px] font-medium ${isSpooky ? "text-purple-100" : "text-[#171d2b]"}`}>
                                {profile?.full_name || (isSpooky ? "Unknown entity" : "No name set")}
                            </p>
                            <p className={`font-sans text-[14px] ${isSpooky ? "text-purple-300/60" : "text-[#171d2b]/60"}`}>
                                {profile?.email}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className={`flex items-center gap-2 font-sans text-[14px] mb-2 ${isSpooky ? "text-purple-300/70" : "text-[#171d2b]/70"}`}>
                                <User size={16} />
                                {isSpooky ? "True Name" : "Full Name"}
                            </label>
                            <input
                                type="text"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                className={`w-full px-4 py-3 rounded-xl border font-sans text-[15px] focus:outline-none transition-colors ${isSpooky ? "border-purple-500/20 bg-[#0d0f14] text-purple-100 focus:border-purple-500/40 placeholder:text-purple-300/30" : "border-[#171d2b]/10 bg-[#f0f0ea] text-[#171d2b] focus:border-[#171d2b]/30"}`}
                                placeholder={isSpooky ? "Reveal your true name" : "Enter your name"}
                            />
                        </div>

                        <div>
                            <label className={`flex items-center gap-2 font-sans text-[14px] mb-2 ${isSpooky ? "text-purple-300/70" : "text-[#171d2b]/70"}`}>
                                <Mail size={16} />
                                {isSpooky ? "Spirit Mail" : "Email"}
                            </label>
                            <input
                                type="email"
                                value={profile?.email || ""}
                                disabled
                                className={`w-full px-4 py-3 rounded-xl border font-sans text-[15px] cursor-not-allowed ${isSpooky ? "border-purple-500/10 bg-[#0a0c10] text-purple-300/50" : "border-[#171d2b]/10 bg-[#e5e5e0] text-[#171d2b]/50"}`}
                            />
                            <p className={`font-sans text-[12px] mt-1 ${isSpooky ? "text-purple-300/40" : "text-[#171d2b]/40"}`}>
                                {isSpooky ? "Bound eternally" : "Email cannot be changed"}
                            </p>
                        </div>
                    </div>

                    {message && (
                        <div className={`mt-4 px-4 py-3 rounded-xl font-sans text-[14px] ${
                            message.type === "success" 
                                ? (isSpooky ? "bg-purple-500/20 text-purple-200 border border-purple-500/30" : "bg-green-50 text-green-700 border border-green-200")
                                : (isSpooky ? "bg-red-500/20 text-red-300 border border-red-500/30" : "bg-red-50 text-red-700 border border-red-200")
                        }`}>
                            {message.text}
                        </div>
                    )}

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`mt-6 px-6 py-3 text-white font-sans text-[15px] font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isSpooky ? "bg-purple-600 hover:bg-purple-500" : "bg-[#171d2b] hover:bg-[#2a3347]"}`}
                    >
                        {saving ? (isSpooky ? "Binding..." : "Saving...") : (isSpooky ? "Seal Changes" : "Save Changes")}
                    </button>
                </div>

                <div className={`rounded-2xl border p-6 ${isSpooky ? "bg-[#151821] border-red-500/30" : "bg-white border-red-200"}`}>
                    <h2 className={`font-serif text-[20px] mb-2 ${isSpooky ? "text-red-400" : "text-red-600"}`}>{isSpooky ? "Forbidden Ritual" : "Danger Zone"}</h2>
                    <p className={`font-sans text-[14px] mb-4 ${isSpooky ? "text-purple-300/60" : "text-[#171d2b]/60"}`}>
                        {isSpooky ? "Banish your soul from this realm. This cannot be undone." : "Once you delete your account, there is no going back. Please be certain."}
                    </p>
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className={`flex items-center gap-2 px-4 py-2.5 font-sans text-[14px] font-medium rounded-xl border transition-colors ${isSpooky ? "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20" : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"}`}
                    >
                        <Trash2 size={16} />
                        {isSpooky ? "Banish Soul" : "Delete Account"}
                    </button>
                </div>
            </div>

            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className={`rounded-2xl p-6 max-w-md w-full ${isSpooky ? "bg-[#151821] border border-purple-500/20" : "bg-white"}`}>
                        <h3 className={`font-serif text-[20px] mb-2 ${isSpooky ? "text-purple-100" : "text-[#171d2b]"}`}>{isSpooky ? "Banish Soul?" : "Delete Account?"}</h3>
                        <p className={`font-sans text-[14px] mb-6 ${isSpooky ? "text-purple-300/60" : "text-[#171d2b]/60"}`}>
                            {isSpooky ? "Your essence will be scattered to the void. All progress will be lost forever." : "This action cannot be undone. All your data will be permanently deleted."}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={deleting}
                                className={`flex-1 px-4 py-2.5 font-sans text-[14px] font-medium rounded-xl transition-colors disabled:opacity-50 ${isSpooky ? "bg-purple-500/20 text-purple-100 hover:bg-purple-500/30" : "bg-[#f0f0ea] text-[#171d2b] hover:bg-[#e5e5e0]"}`}
                            >
                                {isSpooky ? "Retreat" : "Cancel"}
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleting}
                                className="flex-1 px-4 py-2.5 bg-red-600 text-white font-sans text-[14px] font-medium rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {deleting ? (isSpooky ? "Banishing..." : "Deleting...") : (isSpooky ? "Banish" : "Delete")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
