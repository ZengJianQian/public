
document.addEventListener("DOMContentLoaded", async () => {
  // 加载模型配置
  const models = await loadModelConfig();
  // 从后台获取当前状态
  const state = await chrome.runtime.sendMessage({ type: "GET_AUTH_STATE" }); // 获取最新状态  
  console.log("初始化状态:", state);
  renderModelOptions(models, state);
  console.log("模型配置已加载:", models);
  updateUI(state);

});

// 加载模型配置
async function loadModelConfig() {
  try {
    const response = await fetch(chrome.runtime.getURL("config/models.json"));
    return await response.json();
  } catch (e) {
    console.error("加载模型配置失败:", e);
    return { models: [], default_model: null };
  }
}

// 渲染模型选项
function renderModelOptions(config, state) {
  const container = document.getElementById("model-selector");
  container.innerHTML = "";
  const selectedModelId = state?.model || config.default_model;
  config.models.forEach((model) => {
    const option = document.createElement("div");
    option.className = `model-option ${
      model.id === selectedModelId ? "selected" : ""
    }`;
    option.dataset.modelId = model.id;
    option.innerHTML = `
      <img src="${chrome.runtime.getURL(model.icon)}" class="model-icon">
      <div>${model.name}</div>
    `;
    option.addEventListener("click", () => selectModel(model.id));
    container.appendChild(option);
  });
}

// 选择模型
async function selectModel(modelId) {
  // 更新UI
  document.querySelectorAll(".model-option").forEach((el) => {
    el.classList.toggle("selected", el.dataset.modelId === modelId);
  });
  
  // 保存选择
  await chrome.runtime.sendMessage({
    type: "SET_MODEL",
    modelId: modelId,
  });
}

// 更新UI状态
function updateUI(state) {
  if (state?.user) {
    document.getElementById("user-uid").textContent =
      state.user.uid || "--";
    document.getElementById("user-name").textContent =
      state.user.name || "游客";
    document.getElementById("user-avatar").src =
      state.user.avatar || "../assets/default-avatar.png";
  };
  if (state?.isLoggedIn !== undefined) {
   document.getElementById("login-status").textContent = state.isLoggedIn
      ? "已登录"
      : "未登录";
  }
  
  if (state?.room) {
    document.getElementById("room-id").textContent =state.room || "";
  }
  console.log(state);
  if (state?.model) {
    document.querySelectorAll(".model-option").forEach((el) => {
      el.classList.toggle("selected", el.dataset.modelId === state.model);
    });
  }
}
