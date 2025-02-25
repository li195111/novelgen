import { handleChat } from "@/api/chat";
import { StoryChatSchema } from "@/components/story-chat-form";
import { MAX_RESPONSE_LENGTH } from "@/constant";
import { useToast } from "@/hooks/use-toast";
import { assistantMessage, Chat, ChatMessage, systemMessage, userMessage } from "@/models/chat";
import { BRAINSTORM_SYSTEM_PROMPT, DARK_AUDIT_STORY_SYSTEM_PROMPT, NORMAL_AUDIT_STORY_SYSTEM_PROMPT, STORY_CONTENT_EXTEND_GENERATOR_SYSTEM_PROMPT, STORY_CONTENT_MODIFY_AND_EXTEND_GENERATOR_SYSTEM_PROMPT, STORY_SUGGESTION_GENERATOR_SYSTEM_PROMPT, SYSTEM_ABLITERATE_PROMPT, SYSTEM_PROMPT, TITLE_GENERATOR_SYSTEM_PROMPT } from "@/prompts";
import { parseResponse } from "@/utils";
import React, { useEffect, useState } from "react";
import { z } from "zod";

export interface ChatSessionState {
    uid: string;
    messages: ChatMessage[];
    currentResponse: string;
    isStreaming: boolean;
    think: string;
    isThinking: boolean;
    title: string;
    titleResponse: string;
    isTitleStreaming: boolean;
    responseResult: string;
    [key: string]: any;
}

export const useChatSession = (initialMessages: ChatMessage[], currentModel: string, selectedChat: Chat | null, historyRef?: React.RefObject<any>, abortControllerRef?: React.RefObject<any>) => {
    const { toast } = useToast();
    const [userScrolling, setUserScrolling] = useState(false);
    const [chatSession, setChatSession] = useState<ChatSessionState>({
        uid: '',
        messages: selectedChat?.messages ?? initialMessages,
        currentResponse: '',
        isStreaming: false,
        think: '',
        isThinking: false,
        title: selectedChat?.title ?? '',
        titleResponse: '',
        isTitleStreaming: false,
        responseResult: '',
    });

    const resetChatSession = () => {
        setChatSession({
            uid: '',
            messages: initialMessages,
            currentResponse: '',
            isStreaming: false,
            think: '',
            isThinking: false,
            title: '',
            titleResponse: '',
            isTitleStreaming: false,
            responseResult: '',
        })
    }

    const updateChatSession = (updates: Partial<ChatSessionState>) => {
        setChatSession((prev) => ({ ...prev, ...updates }));
    };

    const appendChatSession = async (message: ChatMessage[] | ChatMessage, updateSystem?: ChatMessage): Promise<ChatMessage[]> => {
        if (!Array.isArray(message)) {
            message = [message];
        }
        const newMessages: ChatMessage[] = await new Promise((resolve) => {
            setChatSession((prev) => {
                if (updateSystem) {
                    resolve([updateSystem, ...prev.messages.splice(1), ...message]);
                } else {
                    resolve([...prev.messages, ...message]);
                }
                return prev;
            });
        });
        updateChatSession({ messages: newMessages });
        return newMessages;
    };

    const appendAssistantMessage = () => {
        setChatSession((prev) => {
            return {
                ...prev,
                messages: [...prev.messages, assistantMessage(prev.currentResponse)],
            };
        });
    }

    const sliceToChatSession = async (messageUid?: string): Promise<ChatMessage[]> => {
        const newMessages: ChatMessage[] = await new Promise((resolve) => {
            setChatSession((prev) => {
                if (prev.messages.length < 2) {
                    resolve(prev.messages);
                }
                let newMessages = prev.messages;
                let toUid = undefined;
                if (messageUid) {
                    toUid = prev.messages.findIndex(mes => mes.uid === messageUid);
                    newMessages = prev.messages.slice(0, toUid);
                }
                resolve(newMessages);
                return prev;
            });
        });
        updateChatSession({ messages: newMessages });
        return newMessages;
    }

    const appendChatResponse = (key: string, text: string) => {
        setChatSession((prev) => ({
            ...prev,
            [key]: prev[key] + text,
        }));
    }

    const handleChatStory = async (values: z.infer<typeof StoryChatSchema>, story?: string, darkMode?: boolean, model?: string) => {
        const useModel = model ?? currentModel;
        updateChatSession({ isStreaming: true });
        const storyContent = `
        <story>
        ${story}
        </story>`;
        const SYS_PROMPT = useModel.includes('abliterate') ? SYSTEM_ABLITERATE_PROMPT(darkMode) : SYSTEM_PROMPT(darkMode);
        console.debug('Use Model: ', useModel, 'Contains Abliterate: ', useModel.includes('abliterate'));
        const sysMessage = systemMessage(SYS_PROMPT + (story ? storyContent : ""));
        const newMessages = await appendChatSession(userMessage(values.chatMessage), sysMessage);
        // await handleBackendChat(newMessages, "與 AI 對話時發生錯誤",
        //     (text: string) => updateChatSession({ currentResponse: text }),
        //     (text: string) => appendChatResponse('currentResponse', text),
        //     toast,
        //     abortControllerRef,
        //     model);
        await handleChat(newMessages, "與 AI 對話時發生錯誤",
            (text: string) => updateChatSession({ currentResponse: text }),
            (text: string) => appendChatResponse('currentResponse', text),
            toast,
            abortControllerRef,
            useModel,
        );
        updateChatSession({ isStreaming: false });
    }

    const handleRegenerate = async (messageUid?: string, model?: string) => {
        const useModel = model ?? currentModel;
        updateChatSession({ isStreaming: true });
        const newMessages = await sliceToChatSession(messageUid);
        await handleChat(newMessages, "重新產生對話時發生錯誤",
            (text: string) => updateChatSession({ currentResponse: text }),
            (text: string) => appendChatResponse('currentResponse', text),
            toast,
            abortControllerRef,
            useModel,
        );
        updateChatSession({ isStreaming: false });
    };

    const handleChatTitleSingle = async (messages: ChatMessage[], setResponseCallback: (text: string) => void, appendResponseCallback: (text: string) => void, model?: string) => {
        const useModel = model ?? currentModel;
        const conversationContent = `<query>${JSON.stringify(messages.filter(mes => mes.role === 'user').map(mes => mes.content))}</query>`;
        const genChatTitleMessages = [
            systemMessage(SYSTEM_PROMPT() + TITLE_GENERATOR_SYSTEM_PROMPT),
            userMessage(conversationContent),
        ]
        return await handleChat(genChatTitleMessages, "讓 AI 產生對話Title時發生錯誤",
            setResponseCallback,
            appendResponseCallback,
            toast,
            null,
            useModel,
        );
    }

    const handleChatTitle = async (model?: string) => {
        const useModel = model ?? currentModel;
        updateChatSession({ isTitleStreaming: true });
        const conversationContent = `<query>${JSON.stringify(chatSession.messages.filter(mes => mes.role === 'user').map(mes => mes.content))}</query>`;
        const genChatTitleMessages = [
            systemMessage(SYSTEM_PROMPT() + TITLE_GENERATOR_SYSTEM_PROMPT),
            userMessage(conversationContent),
        ]
        await handleChat(genChatTitleMessages, "讓 AI 產生對話Title時發生錯誤",
            (text: string) => updateChatSession({ titleResponse: text }),
            (text: string) => appendChatResponse('titleResponse', text),
            toast,
            null,
            useModel,
        );
        updateChatSession({ isTitleStreaming: false });
    }

    const handleStorySuggestion = async (values: z.infer<typeof StoryChatSchema>, story?: string, darkMode?: boolean, model?: string) => {
        const useModel = model ?? currentModel;
        updateChatSession({ isStreaming: true });
        const storyContent = `<story>
        ${story}
        </story>`;
        const SYS_PROMPT = useModel.includes('abliterate') ? SYSTEM_ABLITERATE_PROMPT(darkMode) : SYSTEM_PROMPT(darkMode);
        const genStorySuggestionMessages = systemMessage(STORY_SUGGESTION_GENERATOR_SYSTEM_PROMPT(SYS_PROMPT, darkMode) + storyContent);
        const newMessages = await appendChatSession(userMessage(`提供${values.chatMessage}小說故事建議`), genStorySuggestionMessages)
        await handleChat(newMessages, "AI 產生建議時發生錯誤",
            (text: string) => updateChatSession({ currentResponse: text }),
            (text: string) => appendChatResponse('currentResponse', text),
            toast,
            abortControllerRef,
            useModel
        )
        updateChatSession({ isStreaming: false });
    }

    const handleStorySceneSuggestion = async (values: z.infer<typeof StoryChatSchema>, story?: string, darkMode?: boolean, model?: string) => {
        const useModel = model ?? currentModel;
        updateChatSession({ isStreaming: true });
        // const SYS_PROMPT = useModel.includes('abliterate') ? SYSTEM_ABLITERATE_PROMPT(darkMode) : SYSTEM_PROMPT(darkMode);
        // const genStorySuggestionMessages = systemMessage(STORY_SCENE_GENERATEOR_SYSTEM_PROMPT(SYS_PROMPT, darkMode) + storyContent);
        const genStorySuggestionMessages = systemMessage(darkMode ? DARK_AUDIT_STORY_SYSTEM_PROMPT(story, darkMode) : NORMAL_AUDIT_STORY_SYSTEM_PROMPT(story, darkMode));
        const newMessages = await appendChatSession(userMessage(`提供可能發生的${values.chatMessage}${darkMode ? '成人色情內容' : ''}場景`), genStorySuggestionMessages)
        await handleChat(newMessages, "AI 產生場景建議時發生錯誤",
            (text: string) => updateChatSession({ currentResponse: text }),
            (text: string) => appendChatResponse('currentResponse', text),
            toast,
            abortControllerRef,
            useModel
        )
        updateChatSession({ isStreaming: false });
    }

    const handleStoryContentModifyAndExtend = async (values: z.infer<typeof StoryChatSchema>, story?: string, darkMode?: boolean, model?: string) => {
        const useModel = model ?? currentModel;
        updateChatSession({ isStreaming: true });
        const storyContent = `
        <story>
        ${story}
        </story>`;
        const SYS_PROMPT = useModel.includes('abliterate') ? SYSTEM_ABLITERATE_PROMPT(darkMode) : SYSTEM_PROMPT(darkMode);
        const sysMessages = systemMessage(STORY_CONTENT_MODIFY_AND_EXTEND_GENERATOR_SYSTEM_PROMPT(SYS_PROMPT, darkMode) + storyContent);
        const newMessages = await appendChatSession(userMessage(`改寫並增加後續劇情: ${values.chatMessage}`), sysMessages)
        await handleChat(newMessages, "AI 產生場景建議時發生錯誤",
            (text: string) => updateChatSession({ currentResponse: text }),
            (text: string) => appendChatResponse('currentResponse', text),
            toast,
            abortControllerRef,
            useModel,
        )
        updateChatSession({ isStreaming: false });
    }

    const handleStoryContentExtend = async (values: z.infer<typeof StoryChatSchema>, story?: string, darkMode?: boolean, model?: string) => {
        const useModel = model ?? currentModel;
        updateChatSession({ isStreaming: true });
        const storyContent = `
        <story>
        ${story}
        </story>`;
        const SYS_PROMPT = useModel.includes('abliterate') ? SYSTEM_ABLITERATE_PROMPT(darkMode) : SYSTEM_PROMPT(darkMode);
        const sysMessages = systemMessage(STORY_CONTENT_EXTEND_GENERATOR_SYSTEM_PROMPT(SYS_PROMPT, darkMode) + storyContent);
        const newMessages = await appendChatSession(userMessage(`改寫並增加後續劇情: ${values.chatMessage}`), sysMessages)
        await handleChat(newMessages, "AI 產生場景建議時發生錯誤",
            (text: string) => updateChatSession({ currentResponse: text }),
            (text: string) => appendChatResponse('currentResponse', text),
            toast,
            abortControllerRef,
            useModel,
        )
        updateChatSession({ isStreaming: false });
    }

    const scrollToBottom = () => {
        if (!historyRef?.current || userScrolling) return;
        historyRef.current.scrollTo({ top: historyRef.current.scrollHeight, behavior: "smooth" });
    };

    useEffect(() => {
        const historyElement = historyRef?.current;
        if (!historyElement) return;

        const handleScroll = () => {
            const SCROLL_THRESHOLD = 25; // 50px threshold
            const isNearBottom = (historyRef.current.scrollHeight - historyRef.current.scrollTop - historyRef.current.clientHeight) <= SCROLL_THRESHOLD;
            setUserScrolling(!isNearBottom);
        };

        historyElement.addEventListener('scroll', handleScroll);
        return () => historyElement.removeEventListener('scroll', handleScroll);
    }, []);


    useEffect(() => {
        if (!chatSession.isStreaming && chatSession.messages.at(-1)?.role === 'user') {
            // AI 回應完畢, 儲存 AI 的完整回應
            appendAssistantMessage();
        }
        else if (!chatSession.isStreaming && chatSession.messages.at(-1)?.role === 'assistant') {
            scrollToBottom();
            setUserScrolling(true);
        }
    }, [chatSession.messages, chatSession.isStreaming]);

    useEffect(() => {
        if (!chatSession.currentResponse) return;
        scrollToBottom();

        const parsed = parseResponse(chatSession.currentResponse, ["think"]);
        if (parsed) {
            updateChatSession({
                think: parsed.think,
                responseResult: parsed.response,
                isThinking: parsed.isThinking
            });
        }

        if (chatSession.currentResponse.length > MAX_RESPONSE_LENGTH) {
            if (abortControllerRef?.current) {
                abortControllerRef.current.abort();
                updateChatSession({ isStreaming: false });
                toast({
                    title: "回應已中止",
                    description: "回應長度超過限制",
                    variant: "destructive",
                });
            }
        }

    }, [chatSession.currentResponse])

    useEffect(() => {
        // 給予對話標題
        if (chatSession.uid && !chatSession.title && !chatSession.isTitleStreaming && !chatSession.titleResponse && chatSession.messages.at(-1)?.role === 'assistant') {
            console.debug('Generate Chat Title', chatSession);
            // updateChatSession({ isTitleStreaming: true });
            handleChatTitle()
        }

    }, [chatSession.uid, chatSession.messages, chatSession.isTitleStreaming, chatSession.titleResponse, chatSession.title])


    useEffect(() => {
        if (!chatSession.titleResponse) return;
        const parsed = parseResponse(chatSession.titleResponse, ["think", "title"]);
        if (parsed) {
            updateChatSession({ title: parsed.title });
        }
        else {
            console.debug('Failed to generate title: ', chatSession.titleResponse);
            updateChatSession({ title: 'Untitled' });
        }
    }, [chatSession.titleResponse]);

    // useEffect(() => {
    //     console.debug('Selected Chat Change, Update Chat Session');
    // }, [selectedChat])

    // useEffect(() => {
    //     console.debug('messages: ', chatSession.messages);
    // }, [chatSession.messages])

    return {
        chatSession, setChatSession, updateChatSession, resetChatSession,
        handleChatStory, handleRegenerate,
        handleChatTitle, handleChatTitleSingle,
        handleStorySuggestion, handleStorySceneSuggestion,
        handleStoryContentModifyAndExtend,
        handleStoryContentExtend,
    };
};