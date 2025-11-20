from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
import socketio

# 1. 서버 생성
app = FastAPI()
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
socket_app = socketio.ASGIApp(sio, app)

# 2. CORS 설정 (프론트엔드 접속 허용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- [기능 A] 프론트엔드와 연결 (웹소켓) ---
@sio.event
async def connect(sid, environ):
    print(f"📺 프론트엔드 접속 성공! (ID: {sid})")

@sio.event
async def disconnect(sid):
    print(f"❌ 연결 끊김 (ID: {sid})")

# --- [기능 B] 준형씨가 데이터를 보내는 입구 (HTTP API) ---
# 준형씨가 http://localhost:8000/api/input 주소로 데이터를 쏘면 이 함수가 실행됨
@app.post("/api/input")
async def receive_ai_data(data: dict = Body(...)):
    """
    준형씨 AI -> 백엔드 -> 프론트엔드 (토스!)
    """
    # 1. 데이터 수신 로그 (확인용)
    # print(f"📩 데이터 수신: {data}")

    # 2. 프론트엔드로 바로 쏘기 (웹소켓)
    await sio.emit('locus_data', data)
    
    return {"status": "success", "message": "데이터 전송 완료"}

# 실행 명령어: uvicorn server:socket_app --reload --host 0.0.0.0 --port 8000