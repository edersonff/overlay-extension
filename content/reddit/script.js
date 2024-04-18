const isReddit = url.includes("reddit.com");

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

async function loadM3u8ToMp4(url) {
  const response = await fetch(url);
  const text = await response.text();

  const lines = text.split("\n");

  let files = [];

  lines.forEach((line) => {
    let videoSuffix = "";
    let videoUrlDirPath = "";

    if (
      !videoSuffix ||
      line.endsWith(videoSuffix) ||
      line.includes(videoSuffix + "?")
    ) {
      if (line.trim() === "") {
        return;
      }
      if (line.startsWith("#")) {
        return;
      }

      if (line.startsWith("http://") || line.startsWith("https://")) {
        files.push(line);
      } else {
        let file =
          (videoUrlDirPath.endsWith("/")
            ? videoUrlDirPath
            : videoUrlDirPath + "/") + line.replace(/^\//, "");

        files.push(file);
      }
    }
  });

  return files;
}

async function NSFWClickButtons() {
  const containers = await getElementsBySelector(`shreddit-blurred-container`);

  containers.forEach((container) => {
    const overlay = container.shadowRoot.querySelector(`.overlay`);

    if (!overlay) {
      return;
    }

    overlay.click();
  });
}

async function copyLink(parent) {
  const post = () => {
    const img = parent.querySelector(
      `img[fetchpriority="auto"]:not([role="presentation"])`
    );
    if (img) {
      return img.src;
    }

    const video = parent.querySelector(
      `[data-post-click-location="video-player"]`
    );

    return video.getAttribute("src");
  };

  const link = post();

  if (link.includes("m3u8")) {
    const files = await loadM3u8ToMp4(link);

    const filesSize = files.map((file) => file.match(/HLS_(\d+)/)[1]);

    const biggestFile = Math.max(...filesSize);

    const lastFile = files.find((file) => file.includes(`HLS_${biggestFile}`));

    const lastLink = link.replace("/HLSPlaylist.m3u8", lastFile);

    navigator.clipboard.writeText(lastLink);

    return;
  }

  navigator.clipboard.writeText(link);
}

async function appendImageCopyLink() {
  const getItems = async () => {
    const images = await getElementsBySelector(
      `img[fetchpriority="auto"]:not([role="presentation"])`
    );

    const videos = await getElementsBySelector(
      `[data-post-click-location="video-player"]`
    );

    if (images.length === 0 && videos.length === 0) {
      throw new Error("No images or videos found");
    }

    const src = [...videos, ...images];

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
      onclick: (e) => {
        e.stopPropagation();
        copyLink(itemParent);
      },
    });
  });
}

if (isReddit) {
  async function main() {
    NSFWClickButtons();
    await appendImageCopyLink();
  }

  window.addEventListener("navigate", main);
  main();

  setInterval(() => {
    main();
  }, 1000);
}
