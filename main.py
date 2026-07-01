import subprocess
import sys
from pathlib import Path
from typing import List, Optional
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from pydantic import BaseModel

load_dotenv()


class Movie(BaseModel):
    name: str
    description: str
    genres: List[str]
    cast: List[str]
    rating: float
    director: Optional[str] = None
    country: Optional[str] = None
    language: Optional[str] = None
    release_date: Optional[str] = None
    runtime_minutes: Optional[int] = None


class ExtractRequest(BaseModel):
    paragraph: str


ROOT_DIR = Path(__file__).resolve().parent
FRONTEND_DIST = ROOT_DIR / "frontend" / "dist"
FRONTEND_INDEX = FRONTEND_DIST / "index.html"

app = FastAPI(title="Movie Extractor API")


def ensure_frontend_build() -> None:
    if FRONTEND_INDEX.exists():
        return

    script_path = ROOT_DIR / "scripts" / "build_frontend.py"
    if not script_path.exists():
        return

    try:
        subprocess.run([sys.executable, str(script_path)], check=True)
    except subprocess.CalledProcessError:
        return


ensure_frontend_build()

model = ChatGoogleGenerativeAI(model="gemini-2.5-flash-lite", temperature=0)
structured_model = model.with_structured_output(Movie)

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "Extract only explicitly mentioned movie information. if the query is irrelvent then set the schema values to null"),
        ("human", "{paragraph}"),
    ]
)

chain = prompt | structured_model


@app.post("/api/extract", response_model=Movie)
def extract_movie(req: ExtractRequest):
    paragraph = req.paragraph.strip()
    if not paragraph:
        raise HTTPException(
            status_code=400, detail="paragraph cannot be empty")
    try:
        return chain.invoke({"paragraph": paragraph})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if FRONTEND_DIST.exists():
    app.frontend("/", directory="frontend/dist")
