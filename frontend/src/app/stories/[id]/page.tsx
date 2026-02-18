import { notFound } from "next/navigation";
import { getStory } from "@/data/stories";
import StoryPlayer from "./StoryPlayer";

export default async function StoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const story = getStory(id);
  if (!story) notFound();
  return <StoryPlayer story={story} />;
}
