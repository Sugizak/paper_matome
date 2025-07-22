
import Link from "next/link";
export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black p-4 font-sans">
            <Link href='/'>
                <div className="flex items-center gap-4">
                    <h2 className="text-4xl font-bold m-0 pr-4 border-r border-black">
                        404
                    </h2>
                    <p className="text-base m-0">
                        This page could not be found.<br />
                        変なことをするな
                    </p>
                </div>
            </Link>
        </div>
    );
};
