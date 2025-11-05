import Header from "@/components/layout/Header";
import HamburgerMenu from "@/components/layout/Hamburger";

export default function AwardsPage() {
    return (
        <div className="flex flex-col items-center min-h-screen">
            <Header />
            <HamburgerMenu />
            <h1>This is the Awards Page</h1>
        </div>
    );
}
