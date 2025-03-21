FROM node:20-alpine3.18

# Note: If you encounter rate limit issues with Docker Hub,
# consider logging in with 'docker login' or using a specific image digest
# instead of a floating tag.

# Create a non-root user early
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Set working directory
WORKDIR /app

# Set ownership on the workdir
RUN chown nextjs:nodejs /app

# Copy package files with proper ownership
COPY --chown=nextjs:nodejs package.json package-lock.json* ./

# Install dependencies using npm instead of pnpm
RUN npm ci

# Copy rest of the application with proper ownership
COPY --chown=nextjs:nodejs . .

# Build the application
RUN npm run build

# Switch to non-root user
USER nextjs

# Expose the port your app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]