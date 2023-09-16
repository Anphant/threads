import { SignedIn, SignOutButton, OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { dark } from "@clerk/themes";

// Define the Topbar component
function Topbar() {
    return (
        <nav className="topbar">
            {/* Logo and application name linking to the home page */}
            <Link href="/" className="flex items-center gap-4">
                <Image src="/assets/logo.svg" alt="logo" width={28} height={28} />
                <p className="text-heading3-bold text-light-1 max-xs:hidden">Barn</p>
            </Link>

            {/* Organization switcher with custom appearance */}
            <OrganizationSwitcher
                appearance={{
                    baseTheme: dark,
                    elements: {
                        organizationSwitcherTrigger: "py-2 px-4"
                    },
                    variables: {
                        colorPrimary: "red",
                    }
                }}
            />

            <div className="flex items-center gap-1">
                {/* Sign-out button for mobile view */}
                <div className="block md:hidden">
                    <SignedIn>
                        <SignOutButton>
                            <div className="flex cursor-pointer">
                                <Image
                                    src="/assets/logout.svg"
                                    alt="logout"
                                    width={24}
                                    height={24}
                                />
                            </div>
                        </SignOutButton>
                    </SignedIn>
                </div>

                {/* User profile button with name and custom appearance */}
                <UserButton
                    appearance={{
                        baseTheme: dark,
                    }}
                    showName
                />
            </div>
        </nav>
    );
}

export default Topbar;
