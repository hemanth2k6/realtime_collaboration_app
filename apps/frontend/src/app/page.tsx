import Image from "next/image";
import { sharedFunction } from "shared";
import { CollaborativeEditor } from "../components/CollaborativeEditor";

export default function Home() {
  const message = sharedFunction();
  
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black min-h-screen">
      <main className="flex flex-1 w-full flex-col items-center py-16 px-8 bg-white dark:bg-black">
        <h1 className="text-4xl font-bold mb-8 text-black dark:text-zinc-50 text-center">
          AI Collaborative Workspace
        </h1>
        
        <p className="mb-12 text-blue-500 font-medium">
          {message}
        </p>

        {/* Demoing Document ID "demo-doc-1" */}
        <CollaborativeEditor documentId="demo-doc-1" />
      </main>
    </div>
  );
}
