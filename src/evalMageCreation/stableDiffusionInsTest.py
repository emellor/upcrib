from diffusers import StableDiffusionInstructPix2PixPipeline
import torch
from PIL import Image

pipe = StableDiffusionInstructPix2PixPipeline.from_pretrained(
    "timbrooks/instruct-pix2pix", torch_dtype=torch.float16
).to("cuda")

input_image = Image.open("images.jpeg")

edited = pipe(
    prompt="Add a modern wooden deck and glass railing",
    image=input_image,
    strength=0.7,
    guidance_scale=9,
    num_inference_steps=30
).images[0]

edited.save("images.jpeg")
