<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1gK00i1de8XUYs-8lXIHWlAihUOEolOZ4

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
V2更新事项如下：
修改后台管理系统：1、做法：在列表上方加一个下拉框或复选框 —— “只显示有效密钥”。2、密钥列表可以调整用户的次数和时间，同时也可以删除密钥3、名称不能重复，如果密钥列表已经有的名称，再添加新的密钥匙使用相同的名称，会进行提示
