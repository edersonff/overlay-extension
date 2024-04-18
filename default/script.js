const maxTries = 10;
const url = window.location.href;

async function getElementByXpath(path, filter = () => true, force = true) {
  const elem = document.evaluate(
    path,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;

  if ((elem && filter(elem)) || !force) {
    return elem;
  }

  await sleep(100);

  return await getElementByXpath(path);
}

async function getElementsBySelector(path, tries = 0) {
  const elements = document.querySelectorAll(path);

  if ((elements && elements.length > 0) || tries >= maxTries) {
    return elements;
  }

  await sleep(100);

  return await getElementsBySelector(path, tries + 1);
}

async function getElementBySelector(path, filter = () => true, tries = 0) {
  const elements = await getElementsBySelector(path);

  const element = elements[0];

  if ((element && filter(element)) || tries >= maxTries) {
    return element;
  }

  await sleep(100);

  return await getElementBySelector(path, filter, tries + 1);
}
