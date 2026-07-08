# 维护对照表

## 当前拦截的接口

在 `service-worker.js` 顶部的 `ENDPOINTS` 里集中维护：

- `doubao.com/samantha/skill/pack`
- `dola.com/samantha/skill/pack`
- `.com/alice/slot/action_bar_v3/get_item_conf`
- `doubao.com/im/chain/single`
- `dola.com/im/chain/single`

如果插件突然不显示资源，先确认这些接口路径有没有变化。

## 当前依赖字段

图片：

- `image_ori_raw.url`

豆包视频：

- `fallback_api`
- `video_info`
- `video_list`
- `main_url`
- `play_url`
- `key_seed`

Dola 视频：

- `man_url`
- `main_url`

15秒配置：

- `duration`
- `supported_durations`
- `option_key: "15"`
- `value: "15"`
- 标签候选在 `DURATION_LABELS` 中维护。

## 当前无水印请求参数

豆包 `fallback_api` 会追加或覆盖：

```text
channel=no
codec_type=8
logo_type=unwatermarked
```

如果视频仍有水印，优先检查这几个参数是否还生效。

## 失效排查顺序

1. 插件图标是否显示 `ON`。
2. 开启 `DEBUG_LOG_ENABLED`，看 `skill/pack`、`chain/single`、`get_item_conf` 是否命中。
3. 抓 Network，搜索 `chain/single`，检查返回里是否还有 `image_ori_raw`、`fallback_api`。
4. 如果有 `fallback_api`，单独检查返回里是否还有 `main_url` / `play_url`。
5. 如果 URL 是 token，检查是否仍有 `key_seed`，以及 token 前缀是否仍是 `qAAB`。
6. 如果 15 秒不显示，检查 `skill/pack` 和 `get_item_conf` 返回里的时长配置结构。
