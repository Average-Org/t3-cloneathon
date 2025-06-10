import HomeClient from "@/app/home-client";

export default async function ChatRoute({params}: {params: {id: string}}){
    const {id} = await params;
    return <HomeClient chatId={id} />;
}