from PIL import Image, ImageEnhance
from pathlib import Path
import math
root = Path(__file__).parent
(root/'gifs').mkdir(exist_ok=True)
generated = 0
for file in sorted((root/'imagenes').glob('imagen*.jpg')):
    i = int(file.stem.replace('imagen', ''))
    (root/'thumbnails').mkdir(exist_ok=True)
    thumbnail = Image.open(file).convert('RGB')
    thumbnail.thumbnail((360,360))
    thumbnail.save(root/'thumbnails'/file.name,quality=78,optimize=True)
    if (root/'gifs'/f'recuerdo{i}.gif').exists():
        continue
    generated += 1
    source = Image.open(root/'imagenes'/f'imagen{i}.jpg').convert('RGB')
    frames=[]
    for j in range(24):
        t=j/24*math.tau
        # A seamless moving vignette: breathing music, a passing shadow,
        # mountain air, running at dusk, childhood, sea light, a warm embrace.
        zoom=1.05+.035*math.sin(t)
        scale=max(360/source.width,460/source.height)*zoom
        im=source.resize((round(source.width*scale),round(source.height*scale)),Image.Resampling.LANCZOS)
        x=(im.width-360)//2+int((im.width-360)*.15*math.sin(t))
        y=(im.height-460)//2+int((im.height-460)*.12*math.cos(t))
        frame=im.crop((x,y,x+360,y+460))
        frame=ImageEnhance.Brightness(frame).enhance(1+.055*math.sin(t+i))
        frames.append(frame.quantize(colors=128))
    frames[0].save(root/'gifs'/f'recuerdo{i}.gif',save_all=True,append_images=frames[1:],duration=100,loop=0,optimize=True)
print(f'{generated} GIFs nuevos generados; miniaturas actualizadas')
