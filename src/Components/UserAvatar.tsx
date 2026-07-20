import React from 'react';

interface UserProfile {
    name?: string | null;
    avatar?: string | null;
    avatarUpdatedAt?: string | number | null;
    updatedAt?: string | number | null;
}
interface UserAvatarProps {
    userProfile: UserProfile | null | undefined;
    previewUrl?: string | null;
    className?: string;
}

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");

export const UserAvatar: React.FC<UserAvatarProps> = ({
    userProfile,
    previewUrl,
    className = "w-12 h-12 rounded-full object-cover"
}) => {

    if (previewUrl) {
        return <img src={previewUrl} alt="Avatar Preview" className={className} />;
    }

    const rawUrl = userProfile?.avatar;

    if (!rawUrl) {
        return (
            <div className={`${className} bg-indigo-600 flex items-center justify-center text-white font-bold text-sm uppercase`}>
                {userProfile?.name ? userProfile.name.charAt(0) : 'U'}
            </div>
        );
    }

    // 3. Clean up the incoming database string to prevent double slashes or missing slashes
    const isAbsolute = /^https?:\/\//i.test(rawUrl);
    const cleanPath = rawUrl.startsWith("/") ? rawUrl : `/${rawUrl}`;
    const base = isAbsolute ? rawUrl : `${API_BASE_URL}${cleanPath}`;

    // 4. Add the cache-busting timestamp token
    const separator = base.includes("?") ? "&" : "?";
    const token = userProfile?.avatarUpdatedAt || userProfile?.updatedAt || Date.now();
    const finalUrl = `${base}${separator}v=${token}`;

    return (
        <img
            src={finalUrl}
            alt="User Avatar"
            className={className}
            onError={(e) => {
                // If it fails, fallback to structural text initials instead of breaking the UI
                e.currentTarget.style.display = 'none';
            }}
        />
    );
};