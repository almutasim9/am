export const getStoreHealth = (lastVisit) => {
    if (!lastVisit) return 'red';
    const days = Math.floor((Date.now() - new Date(lastVisit).getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 14) return 'green';
    if (days <= 24) return 'amber';
    return 'red';
};

// Format date in English
export const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

// Get relative time (e.g., "3 days ago")
export const getRelativeTime = (date) => {
    if (!date) return '';
    const now = new Date();
    const then = new Date(date);
    const diffMs = now - then;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    }
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
};

export const healthColors = { green: 'bg-emerald-500', amber: 'bg-amber-500', red: 'bg-red-500' };
export const priorityColors = { high: 'bg-red-500', medium: 'bg-amber-500', low: 'bg-blue-500' };

export const copyToClipboard = (text, onSuccess) => {
    navigator.clipboard.writeText(text);
    if (onSuccess) onSuccess();
};
