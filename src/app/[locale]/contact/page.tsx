import Header from "@/components/layout/Header";

export default function ContactPage() {
    return (
        <div className="flex flex-col items-center min-h-screen">
            <Header />
            <main className="flex min-h-screen w-full max-w-6xl flex-col items-center py-32 px-8">
                <h1 className="text-4xl font-bold text-white">This is the Contact Page</h1>
            </main>
        </div>
    );
}
