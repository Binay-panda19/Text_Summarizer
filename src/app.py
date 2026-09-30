from fastapi import FastAPI, Request
from pydantic import BaseModel
from transformers import T5ForConditionalGeneration, T5Tokenizer
import torch
import re
from fastapi.templating import Jinja2Templates #ui
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
import os

# initialize our fastapi app
app = FastAPI(title="Text Summarizer App", description="Text Summarization using T5", version="1.0")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(
    BASE_DIR,
    "../saved_summary_model"
)

TEMPLATES_PATH = os.path.join(
    BASE_DIR,
    "templates"
)

STATIC_PATH = os.path.join(
    BASE_DIR,
    "static"
)

# model and tokenizer
tokenizer = T5Tokenizer.from_pretrained(
    MODEL_PATH
)

model = T5ForConditionalGeneration.from_pretrained(
    MODEL_PATH
)

# device
if torch.backends.mps.is_available():
  device = torch.device("mps")
elif torch.cuda.is_available():
  device = torch.device("cuda")
else:
  device = torch.device("cpu")

model.to(device)
model.eval()

# templating
templates = Jinja2Templates(
    directory=TEMPLATES_PATH
)

app.mount(
    "/static",
    StaticFiles(directory=STATIC_PATH),
    name="static"
)


# input schema for dialogue => string 
class DialogueInput(BaseModel):
  dialogue: str


def clean_data(text):
    text = re.sub(r"\r\n", " ", text) # lines
    text = re.sub(r"\s+", " ", text) # spaces
    text = re.sub(r"<.*?>", " ", text) # html tags 
    text = text.strip().lower()
    return text

def summarize_dialogue(dialogue : str) -> str:
    dialogue = clean_data(dialogue) # clean
    
    # tokenize
    inputs = tokenizer(
        dialogue,
        padding="max_length",
        max_length=512,
        truncation=True,
        return_tensors="pt"
    )

     # Move tensors to same device as model

    input_ids = inputs["input_ids"].to(device)

    attention_mask = inputs["attention_mask"].to(device)


    # Generate summary

    with torch.no_grad():

        targets = model.generate(

            input_ids=input_ids,

            attention_mask=attention_mask,

            max_length=150,

            num_beams=4,

            early_stopping=True
        )
    

    # token ids => convert to summary => decode
    summary = tokenizer.decode(
        targets[0],
        skip_special_tokens=True,
        clean_up_tokenization_spaces=True
    )

    return summary



# end-points
@app.post("/summarize/")
async def summarize(dialogue_input: DialogueInput):
   summary = summarize_dialogue(dialogue_input.dialogue)
   return {"summary" : summary}

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="index.html",
        context={"request": request}
    )
