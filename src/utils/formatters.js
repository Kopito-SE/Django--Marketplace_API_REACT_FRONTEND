export const money = (value) => {
    const amount = Number(value || 0);

    return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
};

export const dateLabel = (value) => {
    if (!value) return 'Not available';

    return new Intl.DateTimeFormat('en-KE', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(value));
};

