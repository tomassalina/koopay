import { ProjectOnboarding } from "@/components/blocks/ProjectOnboarding";
import { WalletButton } from "@/components/tw-blocks/wallet-kit/WalletButtons";

function CreateProject() {
  return (
    <main className="flex flex-col gap-16 p-16 row-start-2 items-center sm:items-start">
      <header className="flex justify-center">
        <WalletButton />
      </header>
      <ProjectOnboarding />
    </main>
  );
}

export default CreateProject;
