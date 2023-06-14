// @constants start
const WIDGET_NAME = "DOM Tree Widget";
const WIDGET_TOOLTIP = `Click on a node to highlight and scroll it on the page. 
  If nothing happened, the element is hidden somewhere:`;
const ignoredTags = ["script", "SCRIPT", "path", "PATH"];
// @constants end

let selectedNode = null;
let isDragging = false;
let offsetX = 0;
let offsetY = 0;
const widgetNodes = [];

// @styles start
const widgetStyles = {
  width: "500px",
  position: "fixed",
  left: "100px",
  top: "100px",
  padding: "20px",
  backgroundColor: "rgb(242, 249, 255, 0.9)",
  border: "1px solid black",
  borderRadius: "24px",
  fontFamily: "Roboto Flex, sans-serif",
  fontSize: "16px",
  zIndex: "9999",
};
const widgetHeaderStyles = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  cursor: "move",
};
const widgetNameStyles = {
  fontSize: "24px",
  marginRight: "15px",
};
const nodeListViewStyles = {
  maxHeight: "400px",
  overflow: "auto",
  whiteSpace: "nowrap",
};

const documentStyle = createElement(
  "style",
  `.highlight { 
        background-color: yellow; 
        border: 2px solid red; 
    } 
    .selected-tag {
        background-color: rgba(76, 172, 255, 0.62);
    }
    .duck::before {
        content: "\uD83E\uDD86";
        margin-right: 5px;
    }
`
);
document.head.appendChild(documentStyle);
// @styles end

// @create elements start
const widgetView = createElement("div", "", widgetStyles);

const widgetHeader = createElement("div", "", widgetHeaderStyles);
widgetHeader.addEventListener("mousedown", function (e) {
  isDragging = true;
  offsetX = e.clientX - widgetView.offsetLeft;
  offsetY = e.clientY - widgetView.offsetTop;
});
document.addEventListener("mousemove", function (e) {
  if (isDragging) {
    const left = e.clientX - offsetX;
    const top = e.clientY - offsetY;
    widgetView.style.left = `${left}px`;
    widgetView.style.top = `${top}px`;
  }
});
document.addEventListener("mouseup", function () {
  isDragging = false;
});

const widgetName = createElement("h1", WIDGET_NAME, widgetNameStyles);
const controls = createControls(widgetView);

appendChildrens(widgetHeader, [widgetName, controls]);

const widgetTooltip = createElement("p", WIDGET_TOOLTIP, {
  margin: "0 0 20px 0",
  fontStyle: "italic",
});

const nodeListView = createElement("div", "", nodeListViewStyles);
// @create elements end

// @render widget start
addNodeToList(nodeListView, document.body);
appendChildrens(widgetView, [widgetHeader, widgetTooltip, nodeListView]);
document.body.appendChild(widgetView);
// @render widget end

// @UI start
function createDuck(parent) {
  const duck = createElement("span");
  duck.classList.add("duck");
  parent.insertBefore(duck, parent.firstChild);
}
function createControls(widgetNode) {
  const closeButton = createCloseButton(widgetNode);
  const viewButton = createViewButton();

  const controls = createElement("div", "", {
    width: "40px",
    display: "flex",
    justifyContent: "space-between",
  });
  appendChildrens(controls, [viewButton, closeButton]);

  return controls;
}

function createViewButton() {
  const viewButton = createElement("div", "_", {
    fontWeight: "bold",
    cursor: "pointer",
    width: "20px",
  });

  viewButton.addEventListener("click", function () {
    if (nodeListView.style.display === "none") {
      nodeListView.style.display = "";
      widgetTooltip.style.display = "";
    } else {
      nodeListView.style.display = "none";
      widgetTooltip.style.display = "none";
    }
  });
  return viewButton;
}

function createCloseButton(widgetNode) {
  const pseudoElementStyles = {
    content: "",
    position: "absolute",
    top: "50%",
    left: "0",
    width: "100%",
    height: "2px",
    backgroundColor: "black",
  };
  const beforeElement = createElement("div", "", {
    ...pseudoElementStyles,
    transform: "rotate(45deg)",
  });
  const afterElement = createElement("div", "", {
    ...pseudoElementStyles,
    transform: "rotate(-45deg)",
  });

  const closeIcon = createElement("div", "", {
    width: "20px",
    height: "20px",
    position: "relative",
    cursor: "pointer",
  });
  appendChildrens(closeIcon, [beforeElement, afterElement]);

  closeIcon.addEventListener("click", function () {
    widgetNode.style.display = "none";
  });

  return closeIcon;
}
// @UI end

// @working with nodes start
function addNodeToList(parentNode, nodeToInsert) {
  if (ignoredTags.includes(nodeToInsert.tagName)) return;

  const wrapper = createElement("ul", "", {
    paddingLeft: "20px",
    marginTop: "0",
  });
  let itemContent = `Tag name: <${nodeToInsert.tagName}>`;
  if (nodeToInsert.classList[0]) {
    itemContent += `, class: "${nodeToInsert.classList[0]}"`;
  }
  const listItem = createElement("li", `${itemContent}.`, {
    maxWidth: "max-content",
    listStyleType: "none",
    cursor: "pointer",
  });
  widgetNodes.push(listItem);
  createDuck(listItem);

  listItem.addEventListener("click", function (e) {
    e.stopPropagation();
    highlightAndScrollToNode(nodeToInsert);
    widgetNodes.forEach((node) => node.classList.remove("selected-tag"));
    listItem.classList.add("selected-tag");
  });

  wrapper.appendChild(listItem);
  parentNode.appendChild(wrapper);

  if (nodeToInsert.children.length > 0) {
    const sublist = createElement("li", "", { listStyleType: "none" });
    wrapper.appendChild(sublist);

    Array.from(nodeToInsert.children).forEach(function (childNode) {
      addNodeToList(sublist, childNode);
    });
  }
}
// @working with nodes end

// @actions start
function isElementVisible(element) {
  const { top, bottom, left, right } = element.getBoundingClientRect();
  const { innerHeight, innerWidth } = window;
  const { clientHeight, clientWidth } = document.documentElement;

  const isTopVisible = top >= 0;
  const isLowerVisible = bottom <= (innerHeight || clientHeight);
  const isLeftVisible = left >= 0;
  const isRightVisible = right <= (innerWidth || clientWidth);

  return isTopVisible && isLowerVisible && isLeftVisible && isRightVisible;
}

function highlightAndScrollToNode(node) {
  if (node === selectedNode) {
    return;
  }
  if (selectedNode) {
    selectedNode.classList.remove("highlight");
  }
  node.classList.add("highlight");
  selectedNode = node;

  if (!isElementVisible(node)) {
    node.scrollIntoView({ behavior: "smooth" });
  }
}
// @actions end

// @helpers start
function createElement(tag, content = null, styles = null) {
  const element = document.createElement(tag);
  if (content) {
    element.textContent = content;
  }
  if (styles) {
    for (let attributes in styles) {
      element.style[attributes] = styles[attributes];
    }
  }
  return element;
}
function appendChildrens(parent, childrens) {
  childrens.forEach((children) => parent.appendChild(children));
}
// @helpers end
