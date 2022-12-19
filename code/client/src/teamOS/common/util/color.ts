export function getBaseColor(imgSrc:string) {
    return new Promise((resolve, reject)=>{
        let img = document.createElement("img");
        img.crossOrigin = "Anonymous"
        img.src=imgSrc
        let canvas = document.createElement('canvas')
        let context = canvas.getContext("2d");
        img.onload=function() {
            let width=canvas.width = img.width || img.offsetWidth || img.clientWidth;
            let height=canvas.height = img.height || img.offsetHeight || img.clientHeight;
            context.drawImage(img, 0, 0, canvas.width, canvas.height);
            let data = context.getImageData(0, 0, img.width, img.height).data;
            let r = 1,
                g = 1,
                b = 1;
            for (let row = 0; row < img.height; row++) {
                for (let col = 0; col < img.width; col++) {
                    if (row == 0) {
                        r += data[((img.width * row) + col)];
                        g += data[((img.width * row) + col) + 1];
                        b += data[((img.width * row) + col) + 2];
                    } else {
                        r += data[((img.width * row) + col) * 4];
                        g += data[((img.width * row) + col) * 4 + 1];
                        b += data[((img.width * row) + col) * 4 + 2];
                    }
                }
            }
            r /= (img.width * img.height);
            g /= (img.width * img.height);
            b /= (img.width * img.height);

            r = Math.round(r);
            g = Math.round(g);
            b = Math.round(b);
            resolve([r, g, b])
        }

    })


}