const isDiscord = url.includes("discord.com");

function newOverlay(id) {
  var overlay = document.createElement("div");
  overlay.id = id;
  document.body.appendChild(overlay);
}

function newItem(id, type, parent, props) {
  var elem = document.createElement(type);
  elem.id = id;
  for (var prop in props) {
    elem[prop] = props[prop];
  }
  parent.appendChild(elem);

  return elem;
}

async function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function copyLink(parent) {
  const post = () => {
    const img = parent.querySelector('a[data-role="img"]');
    if (img) {
      return img.src;
    }

    const video = parent.querySelector("video");

    return video.src;
  };

  const link = post();
  navigator.clipboard.writeText(link);
}

async function appendImageCopyLink() {
  const getItems = async () => {
    const images = await getElementsBySelector(
      `div > div > div > div > div > div > a[data-role="img"]`
    );
    const videos = await getElementsBySelector(`div > div > video`);

    if (images.length === 0 && videos.length === 0) {
      throw new Error("No images or videos found");
    }

    const imageWithHref = Array.from(images).filter((image) => image.href);

    const src = [...videos, ...imageWithHref];

    return src;
  };

  const items = await getItems();

  items.forEach((item) => {
    const itemParent = item.parentElement;

    const hasCopyLink = itemParent.querySelector("#copy-link-parent");

    if (hasCopyLink) {
      return;
    }

    const copyLinkParent = newItem("copy-link-parent", "div", itemParent, {});

    newItem("copy-link", "a", copyLinkParent, {
      innerHTML: "Copy Link",
      onclick: () => copyLink(itemParent),
    });
  });
}

if (isDiscord) {
  async function main() {
    await appendImageCopyLink();
  }

  window.addEventListener("navigate", main);
  main();

  setInterval(() => {
    main();
  }, 1000);
}
