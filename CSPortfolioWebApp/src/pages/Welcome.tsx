interface WelcomeProps {
    onTabChange: (tab: string) => void;
}

export const Welcome = ({ onTabChange }: WelcomeProps) => {
    return (
        <div className="flex w-full h-full items-center justify-center p-6">
            <div className="animate-fadeIn w-full max-w-xl text-center space-y-6">

                <h1 className="text-5xl font-bold tracking-tight text-primary">
                    Welcome to CS2 Inventory Pro
                </h1>

                <p className="text-muted-foreground text-lg max-w-md mx-auto">
                    The smart way to track, manage, and optimize your inventory.
                </p>

                <div className="flex flex-col items-center space-y-3 pt-2">
                    <button
                        onClick={() => onTabChange("login")}
                        className="w-60 px-6 py-3 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90 shadow transition"
                    >
                        Login
                    </button>

                    <button
                        onClick={() => onTabChange("register")}
                        className="w-60 px-6 py-3 rounded-md border border-primary text-primary font-semibold hover:bg-primary/5 transition"
                    >
                        Create an Account
                    </button>
                </div>

                <p className="text-sm text-muted-foreground pt-4">
                    Take control of your stock — track everything effortlessly.
                </p>

            </div>
        </div>
    );
};
