import puppeteer from "puppeteer";

export default defineEventHandler(async (event) => {
  // const config = useRuntimeConfig(event);
  const bodyString = await readBody(event);
  const body = JSON.parse(JSON.parse(bodyString));

  console.log("body parsed", body.productID);
  const url = "https://demo-pinturas-popular.vercel.app/";

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
  await page.goto(`${url}ficha-tecnica?productID=${body.productID}`, {
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

  // const pdfName = `ficha-tecnica.pdf`;
  // // Genera el PDF
  const pdfBuffer = await page.pdf({
    path: `./public/fichas-tecnica/${body.productID}.pdf`, // Local store
    format: "A4",
    // pageRanges: '1-8',
    printBackground: true,
  });

  // // // Cierra el navegador
  await browser.close();

  // const formData = new FormData();

  // const pdfBlob = new Blob([pdfBuffer], { type: "application/pdf" });

  // formData.append("folder", config.private.directus.folders.orders);
  // formData.append("title", pdfName);
  // formData.append("file", pdfBlob);

  // const uploadFile = await fetch(`${config.private.directus.url}/files`, {
  //   method: "POST",
  //   headers: {
  //     Accept: "application/json",
  //     Authorization: `Bearer ${config.private.directus.token}`,
  //   },
  //   body: formData,
  // });

  // const { data: uploadRes } = await uploadFile.json();

  // return uploadRes.id;
  return 200;
});
