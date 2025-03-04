import puppeteer from "puppeteer";

export default defineEventHandler(async (event) => {
  // const config = useRuntimeConfig(event);
  const bodyString = await readBody(event);
  const body = JSON.parse(bodyString);

  console.log("body", body);

  const productionURL = "https://demo-pinturas-popular.vercel.app/";
  const devURL = "http://localhost:3000/";
  const directusURL = "https://admin.niguafreezone.com/"

  // // Lanza el navegador
  const browser = await puppeteer.launch({
    headless: true,
    ignoreDefaultArgs: ["--disable-extensions"],
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  // Abre una nueva página
  const page = await browser.newPage();

  // Establece el tamaño de la ventana.
  await page.setViewport({ width: 1280, height: 720 });

  // Carga tu HTML con TailwindCSS
  await page.goto(`${productionURL}ficha-tecnica?productID=${body.productID}`, {
    waitUntil: "networkidle0",
  });

  // await page.evaluate(() => setTimeout(() => {}, 20000));
  await page.waitForSelector("#loaded-content", { timeout: 10000 });

  await page.$$eval('[id^="ficha-content"]', (elms) =>
    elms.map((elm) => elm.innerHTML)
  );

  const selectorToRemove = ".noshow-pdf";
  await page.evaluate((sel) => {
    const elements = document.querySelectorAll(sel);
    for (let i = 0; i < elements.length; i++) {
      elements[i].parentNode.removeChild(elements[i]);
    }
  }, selectorToRemove);

  const pdfName = `ficha-tecnica.pdf`;
  // // Genera el PDF
  const pdfBuffer = await page.pdf({
    // path: `./public/fichas-tecnica/${body.productID}.pdf`, // Local store
    format: "A4",
    // pageRanges: '1-8',
    printBackground: true,
  });

  // // // Cierra el navegador
  await browser.close();

  const formData = new FormData();

  const pdfBlob = new Blob([pdfBuffer], { type: "application/pdf" });

  formData.append("folder", "1391c2b3-3477-40d0-a3a1-ba5e0bef8208");
  formData.append("title", pdfName);
  formData.append("file", pdfBlob);

  const uploadFile = await fetch(`${directusURL}files`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer bYyxa_1Se6D3itri_G3jJ96bRhMN8rxo`,
    },
    body: formData,
  });

  const { data: uploadRes } = await uploadFile.json();
  console.log(uploadRes.id);
  return uploadRes.id;
  // return `https://demo-pinturas-popular.vercel.app/fichas-tecnica/${body.productID}.pdf`;
});
