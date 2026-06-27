#!/bin/bash
# sync-main.sh - 从 dev 分支合并到 main 分支，自动处理品牌重命名
# 用法: ./scripts/sync-main.sh

set -e

echo "=== SumoCode Main 分支同步脚本 ==="
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
    git stash push -m "auto-stash before sync-main $(date +%Y%m%d-%H%M%S)"
    STASHED=true
else
    STASHED=false
fi

echo -e "${GREEN}切换到 main 分支...${NC}"
git checkout main

echo -e "${GREEN}合并 dev 分支到 main...${NC}"
if git merge dev --no-edit --allow-unrelated-histories 2>/dev/null; then
    echo -e "${GREEN}合并成功（无冲突）${NC}"
else
    echo -e "${YELLOW}合并有冲突，正在自动解决品牌重命名冲突...${NC}"
    
    CONFLICTED=$(git diff --name-only --diff-filter=U)
    
    if [ -z "$CONFLICTED" ]; then
        echo -e "${GREEN}没有冲突文件${NC}"
    else
        echo "冲突文件:"
        echo "$CONFLICTED"
        echo ""
        
        for file in $CONFLICTED; do
            if [ -f "$file" ]; then
                echo -e "处理: ${YELLOW}$file${NC}"
                git checkout --theirs "$file" 2>/dev/null || true
                
                # 品牌重命名
                sed -i 's/opencode/sumocode/g' "$file"
                sed -i 's/@opencode-ai/@sumocode-ai/g' "$file"
                sed -i 's|\.opencode/|.sumocode/|g' "$file"
                
                # 保护 URL
                sed -i 's|sumocode\.ai|opencode.ai|g' "$file"
                sed -i 's|github\.com/anomalyco/sumocode|github.com/anomalyco/opencode|g' "$file"
                sed -i 's|github\.com/xiaosu-a/sumocode|github.com/xiaosu-a/opencode|g' "$file"
                
                git add "$file"
            fi
        done
        
        git commit --no-edit 2>/dev/null || true
        echo -e "${GREEN}冲突已解决${NC}"
    fi
fi

# 应用品牌重命名到新文件
echo ""
echo -e "${GREEN}应用品牌重命名...${NC}"

# 处理 package.json 文件
for f in $(find . -name "package.json" -not -path "./.git/*" -not -path "./node_modules/*"); do
    if grep -q "opencode" "$f" 2>/dev/null; then
        echo "  处理: $f"
        sed -i 's/"name": "opencode"/"name": "sumocode"/g' "$f"
        sed -i 's/@opencode-ai/@sumocode-ai/g' "$f"
        sed -i 's/opencode-ai/sumocode-ai/g' "$f"
        sed -i 's|sumocode\.ai|opencode.ai|g' "$f"
        sed -i 's|github\.com/anomalyco/sumocode|github.com/anomalyco/opencode|g' "$f"
    fi
done

# 处理源代码中的 import
for f in $(find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v .git); do
    if grep -q "@opencode-ai" "$f" 2>/dev/null; then
        echo "  处理: $f"
        sed -i 's/@opencode-ai/@sumocode-ai/g' "$f"
    fi
done

# 验证
echo ""
echo -e "${GREEN}验证合并结果...${NC}"

if grep -q '"name": "sumocode"' package.json; then
    echo -e "  ${GREEN}✓${NC} package.json name = sumocode"
else
    echo -e "  ${RED}✗${NC} package.json name 不正确"
fi

if [ -d ".sumocode" ]; then
    echo -e "  ${GREEN}✓${NC} .sumocode/ 目录存在"
else
    echo -e "  ${RED}✗${NC} .sumocode/ 目录不存在！"
fi

if [ -f ".sumocode/sumocode.jsonc" ]; then
    echo -e "  ${GREEN}✓${NC} .sumocode/sumocode.jsonc 存在"
else
    echo -e "  ${RED}✗${NC} .sumocode/sumocode.jsonc 不存在！"
fi

# 提交品牌重命名
git add -A
git commit -m "feat: apply brand rename opencode→sumocode" 2>/dev/null || true

# 推送
echo ""
echo -e "${GREEN}推送到 origin/main...${NC}"
git push origin main

if [ "$STASHED" = true ]; then
    echo -e "${YELLOW}恢复之前 stash 的修改...${NC}"
    git stash pop
fi

echo ""
echo -e "${GREEN}=== 同步完成 ===${NC}"
echo ""
echo "下一步建议："
echo "  1. 检查构建: bun install && bun run build"
echo "  2. 检查测试: bun test"
echo "  3. 验证品牌重命名是否完整"
