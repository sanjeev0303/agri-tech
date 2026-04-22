let loadPromise: Promise<boolean> | null = null;

export const loadRazorpay = (): Promise<boolean> => {
    // 1. If already loading or loaded, return the existing promise
    if (loadPromise) {
        return loadPromise;
    }

    // 2. If Razorpay is already available on window, return resolved promise
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
        loadPromise = Promise.resolve(true);
        return loadPromise;
    }

    // 3. Create a single promise for the entire application lifecycle
    loadPromise = new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.id = "razorpay-checkout-js";
        
        script.onload = () => {
            // Tiny buffer to allow internal SDK initialization (fixes "undefined" build errors)
            setTimeout(() => {
                resolve(true);
            }, 50);
        };
        
        script.onerror = () => {
            loadPromise = null; // Allow retry on failure
            resolve(false);
        };
        
        document.body.appendChild(script);
    });

    return loadPromise;
};
