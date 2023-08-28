import requests
from dotenv import load_dotenv
import io
import os
import base64
from PIL import Image, PngImagePlugin

load_dotenv()

URL = "http://127.0.0.1:7860"
OUTPUT_DIR = "outputs/"
NOTION_TOKEN = os.environ.get("NOTION_KEY")
DATABASE_ID = os.environ.get("NOTION_PAGE_ID")


def set_models(model_name):
    response = requests.get(f'{URL}/sdapi/v1/options')
    json_data = response.json()
    # print(f'json_data: {json_data}')

    json_data['sd_model_checkpoint'] = model_name
    response = requests.post(f'{URL}/sdapi/v1/options', json=json_data)


def get_models():
    response = requests.get(f'{URL}/sdapi/v1/sd-models')
    json_data = response.json()
    # print(f'json_data: {json_data}')
    for data in json_data:
        print(f'name: {data["model_name"]}')


def get_samplers():
    response = requests.get(f'{URL}/sdapi/v1/samplers')
    json_data = response.json()
    for data in json_data:
        print(f'name: {data["name"]}')


def draw_image(prompt):
    payload = {
        "prompt": prompt,
        "sampler_name": "DPM++ 2M Karras",
        "steps": 30,
        "cfg_scale": 7,
        "width": 1024,
        "height": 1024,
        "negative_prompt": "",

    }
    response = requests.post(url=f'{URL}/sdapi/v1/txt2img', json=payload)

    r = response.json()

    for idx, image in enumerate(r["images"]):
        image_data = Image.open(io.BytesIO(
            base64.b64decode(image.split(",", 1)[0])))

        png_payload = {
            "image": "data:image/png;base64," + image
        }
        response2 = requests.post(
            url=f'{URL}/sdapi/v1/png-info', json=png_payload)

        pnginfo = PngImagePlugin.PngInfo()
        pnginfo.add_text("parameters", response2.json().get("info"))
        image_data.save(f'{OUTPUT_DIR}{idx}.png', pnginfo=pnginfo)


def get_pages(num_pages=None):
    headers = {
        "Authorization": "Bearer " + NOTION_TOKEN,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
    }

    url = f"https://api.notion.com/v1/databases/{DATABASE_ID}/query"
    get_all = num_pages is None
    page_size = 100 if get_all else num_pages

    payload = {"page_size": page_size}
    response = requests.post(url, json=payload, headers=headers)

    data = response.json()

    # Comment this out to dump all data to a file
    # import json
    # with open("db.json", "w", encoding="utf8") as f:
    #     json.dump(data, f, ensure_ascii=False, indent=4)

    results = data["results"]
    # print(f"results: {results}")

    while data["has_more"] and get_all:
        payload = {"page_size": page_size, "start_cursor": data["next_cursor"]}
        url = f"https://api.notion.com/v1/databases/{DATABASE_ID}/query"
        response = requests.post(url, json=payload, headers=headers)
        data = response.json()
        results.extend(data["results"])

    import json
    with open("data.json", "w", encoding="utf8") as f:
        json.dump(results, f, ensure_ascii=False, indent=4)

    return results


def main():
    # results = get_pages(100)
    # for result in results:
    #     plain_text = result['properties']['prompt']['title'][0][
    #         'plain_text']
    #     print(f"plain_text: {plain_text}")

    # get_samplers()

    # get_models()

    set_models("sd_xl_base_1.0")

    draw_image("puppy dog")


main()
