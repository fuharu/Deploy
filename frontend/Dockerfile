FROM node:20-alpine

WORKDIR /app

# 依存関係のインストール（キャッシュ効率化）
COPY package*.json ./
RUN npm ci || npm install

# アプリケーションのコピー
COPY . .

# Next.jsのビルド（本番環境用）
# RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "dev"]