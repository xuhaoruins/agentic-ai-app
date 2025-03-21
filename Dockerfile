FROM node:18-alpine

# Create a non-root user early
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Set working directory
WORKDIR /app

# Set ownership on the workdir
RUN chown nextjs:nodejs /app

# Copy package files with proper ownership
COPY --chown=nextjs:nodejs package.json pnpm-lock.yaml ./

# Install dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy rest of the application with proper ownership
COPY --chown=nextjs:nodejs . .

# Build the application with detailed error output
RUN pnpm run build

# Switch to non-root user
USER nextjs

# Expose the port your app runs on
EXPOSE 3000

# Start the application
CMD ["pnpm", "run", "start"]