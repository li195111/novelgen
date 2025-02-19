// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::sync::{ Arc, Mutex as StdMutex };
use tokio::sync::Mutex;
use tauri::{ Manager, State, AppHandle, Emitter };
use tokio_stream::StreamExt;

use ollama_rs::{
    generation::chat::{ request::ChatMessageRequest, ChatMessage, ChatMessageResponseStream },
    Ollama,
};

#[derive(Clone, serde::Serialize)]
struct Payload {
    role: String,
    content: String,
}

#[derive(Default, Debug)]
struct AppState {
    ollama: Ollama,
}

#[tauri::command]
async fn handle_ollama_chat(
    app: AppHandle,
    state: State<'_, Mutex<AppState>>,
    messages: Vec<ChatMessage>,
    model: String
) -> Result<String, ()> {
    let mut state = state.lock().await;
    let ollama = &mut state.ollama;
    let history = Arc::new(StdMutex::new(vec![]));
    let user_prompt = messages.last().unwrap().content.clone();
    let mut stream: ChatMessageResponseStream = ollama
        .send_chat_messages_with_history_stream(
            history.clone(),
            ChatMessageRequest::new(model.clone(), vec![ChatMessage::user(user_prompt)])
        ).await
        .unwrap();

    let mut response = String::new();
    while let Some(Ok(res)) = stream.next().await {
        response += res.message.content.as_str();
        app.emit("ollama_chat_stream_event", Payload {
            role: "assistant".to_string(),
            content: res.message.content,
        }).unwrap();
    }
    Ok(response)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder
        ::default()
        .setup(|app| {
            app.manage(
                Mutex::new(AppState {
                    ollama: Ollama::new("http://localhost".to_string(), 11434),
                })
            );
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![handle_ollama_chat])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
