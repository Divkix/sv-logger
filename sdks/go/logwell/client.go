package logwell

import (
	"context"
	"sync"
)

// Client is the main entry point for sending logs to Logwell.
type Client struct {
	config *Config

	queue     *batchQueue
	transport *httpTransport

	mu sync.Mutex
}

// New creates a new Logwell client with the given endpoint and API key.
// Returns an error if the configuration is invalid.
//
// Example:
//
//	client, err := logwell.New(
//	    "https://logs.example.com",
//	    "lw_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
//	    logwell.WithService("my-app"),
//	    logwell.WithBatchSize(50),
//	)
func New(endpoint, apiKey string, opts ...Option) (*Client, error) {
	// Create config with defaults
	cfg := newDefaultConfig(endpoint, apiKey)

	// Apply options
	for _, opt := range opts {
		opt(cfg)
	}

	// Validate config
	if err := validateConfig(cfg); err != nil {
		return nil, err
	}

	queue := newBatchQueue()
	transport := newHTTPTransport(endpoint, apiKey)

	return &Client{
		config:    cfg,
		queue:     queue,
		transport: transport,
	}, nil
}

// Info logs a message at INFO level.
// Accepts optional metadata maps that will be merged (later maps override earlier).
func (c *Client) Info(message string, metadata ...map[string]any) {
	c.log(LevelInfo, message, metadata...)
}

// log is the internal logging method used by all level methods.
func (c *Client) log(level LogLevel, message string, metadata ...map[string]any) {
	entry := LogEntry{
		Level:     level,
		Message:   message,
		Timestamp: now(),
		Service:   c.config.Service,
		Metadata:  mergeMetadata(c.config.Metadata, mergeMetadata(metadata...)),
	}

	c.mu.Lock()
	c.queue.add(entry)
	shouldFlush := c.queue.size() >= c.config.BatchSize
	c.mu.Unlock()

	if shouldFlush {
		c.flush()
	}
}

// flush sends all queued log entries to the server.
func (c *Client) flush() {
	entries := c.queue.flush()
	if len(entries) == 0 {
		return
	}

	// Send logs (fire and forget for now, error handling added later)
	ctx := context.Background()
	_, _ = c.transport.send(ctx, entries)
}

// mergeMetadata combines multiple metadata maps into one.
// Later maps override earlier ones for duplicate keys.
func mergeMetadata(maps ...map[string]any) map[string]any {
	if len(maps) == 0 {
		return nil
	}

	result := make(map[string]any)
	for _, m := range maps {
		for k, v := range m {
			result[k] = v
		}
	}

	if len(result) == 0 {
		return nil
	}

	return result
}
