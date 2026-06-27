#!/bin/bash
# sync-dev.sh - 从上游同步最新代码到 dev 分支
# 用法: ./scripts/sync-dev.sh

set -e

echo "=== SumoCode Dev 分支同步脚本 ==="
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}错误: 当前目录不是 git 仓库${NC}"
    exit 1
fi

if ! git diff --quiet || ! git diff --cached --quiet; then
    echo -e "${YELLOW}警告: 有未提交的修改，将先 stash${NC}"
    git stash push -m "auto-stash before sync-dev $(date +%Y%m%d-%H%M%S)"
    STASHED=true
else
    STASHED=false
fi

if ! git remote get-url upstream > /dev/null 2>&1; then
    echo -e "${YELLOW}upstream remote 不存在，正在添加...${NC}"
    git remote add upstream https://github.com/anomalyco/opencode.git
fi

echo -e "${GREEN}切换到 dev 分支...${NC}"
git checkout dev

echo -e "${GREEN}从上游拉取最新代码...${NC}"
git fetch --depth=1 upstream dev

CURRENT=$(git rev-parse --short HEAD)
UPSTREAM=$(git rev-parse --short FETCH_HEAD)

echo ""
echo "当前 dev: $CURRENT"
echo "上游最新: $UPSTREAM"

if [ "$CURRENT" = "$UPSTREAM" ]; then
    echo -e "${GREEN}dev 分支已是最新，无需更新${NC}"
else
    echo -e "${YELLOW}正在更新 dev 分支...${NC}"
    git reset --hard FETCH_HEAD
    
    echo -e "${GREEN}推送到 origin...${NC}"
    git push origin dev --force
    
    echo -e "${GREEN}dev 分支已更新: $CURRENT -> $UPSTREAM${NC}"
fi

if [ "$STASHED" = true ]; then
    echo -e "${YELLOW}恢复之前 stash 的修改...${NC}"
    git stash pop
fi

echo ""
echo -e "${GREEN}=== 同步完成 ===${NC}"
