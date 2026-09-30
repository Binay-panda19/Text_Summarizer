from fastapi import FastAPI, Requests
from pydantic import BaseModel
from transformers import T5ForConditionalGeneration, T5Tokenizer
import torch
import re
from fastapi.templating import Jinja2Templates #ui
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles


# initialize our fastapi app
app = FastAPI(title="Text Summarizer App", description="Text Summarization using T5", version="1.0")

# model and tokenizer
model = T5ForConditionalGeneration.from_pretrained("./saved_summary_model")
tokenizer = T5Tokenizer.from_pretrained("./saved_summary_model")


# device
if torch.backends.mps.is_available():
  device = torch.device("mps")
elif torch.cuda.is_available():
  device = torch.device("cuda")
else:
  device = torch.device("cpu")

model.to(device)

# templating
templates = Jinja2Templates(directory="./src")

# input schema for dialogue => string 
class DialogueInput(BaseModel):
  dialogue: str


def clean_data(text):
    text = re.sub(r"\r\n", " ", text) # lines
    text = re.sub(r"\s+", " ", text) # spaces
    text = re.sub(r"<.*?>", " ", text) # html tags 
    text = text.strip().lower()
    return text

def summarize_dialogue(dialogue):
    dialogue = clean_data(dialogue)
    
    # tokenize
    inputs = tokenizer(
        dialogue,
        padding="max_length",
        max_length=512,
        truncation=True,
        return_tensors="pt"
    )
    
    # generate the summary => token ids
    targets = model.generate(
        input_ids = inputs["input_ids"],
        attention_mask = inputs["attention_mask"],
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



