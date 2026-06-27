# SumoCode 分支同步指南

## 架构概览

```
┌─────────────────────────────────────────────────────────────────┐
│                    GitHub Repository                             │
│                  xiaosu-a/opencode                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    sync-dev     ┌──────────────┐              │
│  │   upstream    │ ──────────────→ │     dev      │              │
│  │ (anomalyco/   │   fetch + push  │  (官方镜像)   │              │
│  │  opencode)    │                 │  只读不改     │              │
│  └──────────────┘                 └──────┬───────┘              │
│                                          │                       │
│                                          │ merge                 │
│                                          ▼                       │
│                                  ┌──────────────┐               │
│                                  │     main      │               │
│                                  │  (实战分支)    │               │
│                                  │  品牌重命名    │               │
│                                  │  自定义配置    │               │
│                                  └──────────────┘               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 分支职责

| 分支 | 来源 | 权限 | 职责 |
|------|------|------|------|
| `dev` | upstream (anomalyco/opencode) | **只读**，仅通过 sync 脚本更新 | 镜像官方最新代码 |
| `main` | 本地自定义 | **读写** | 实战分支，品牌重命名 + 自定义功能 |

## 品牌重命名规则

| 原始 | 重命名后 | 说明 |
|------|----------|------|
| `opencode` | `sumocode` | 产品名（文件名、包名等） |
| `@opencode-ai/*` | `@sumocode-ai/*` | npm workspace scope |
| `.opencode/` | `.sumocode/` | 配置目录 |
| `opencode-ai` | `sumocode-ai` | npm 包名 |
| `opencode.ai` | **不改** | 官方 URL 保留 |
| GitHub URLs | **不改** | 官方仓库 URL 保留 |

## 同步流程

### 1. 更新 dev 分支（从上游拉取）

```bash
# 使用脚本
./scripts/sync-dev.sh

# 或手动执行
git checkout dev
git fetch --depth=1 upstream dev
git reset --hard FETCH_HEAD
git push origin dev --force
```

### 2. 合并 dev 到 main

```bash
# 使用脚本
./scripts/sync-main.sh

# 或手动执行
git checkout main
git merge dev --no-edit --allow-unrelated-histories
# 解决冲突后应用品牌重命名
git push origin main
```

### 3. 冲突解决策略

#### 3.1 品牌重命名冲突
上游引入了新的 `opencode` 引用，需要改为 `sumocode`：

```bash
sed -i 's/opencode/sumocode/g' <file>
sed -i 's/@opencode-ai/@sumocode-ai/g' <file>
# 保护 URL
sed -i 's|sumocode\.ai|opencode.ai|g' <file>
```

#### 3.2 配置目录冲突
确保 `.sumocode/` 目录保留：

```bash
git checkout main -- .sumocode/
```

## 自动化脚本

| 脚本 | 用途 |
|------|------|
| `scripts/sync-dev.sh` | 从上游同步到 dev 分支 |
| `scripts/sync-main.sh` | 从 dev 合并到 main，自动处理品牌重命名 |

## 注意事项

1. **dev 分支绝对不能直接修改**，只能通过 sync 脚本从上游拉取
2. **合并前先 stash** 本地未提交的修改
3. **合并后务必验证**：
   - `package.json` 的 name 字段
   - `.sumocode/` 目录完整性
   - 关键 import 路径
4. **shallow clone**：使用 `--depth=1` 减少下载量
5. **推送前先 pull**：避免远程有更新导致冲突
