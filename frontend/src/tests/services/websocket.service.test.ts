import wsService, { WebSocketMessage } from '../../services/websocket.service';

describe('WebSocketService', () => {
  let mockWebSocket: any;
  let mockOnOpen: any;
  let mockOnMessage: any;
  let mockOnClose: any;
  let mockOnError: any;

  beforeEach(() => {
    // Mock WebSocket
    mockWebSocket = {
      onopen: null,
      onmessage: null,
      onclose: null,
      onerror: null,
      send: jest.fn(),
      close: jest.fn(),
      readyState: WebSocket.OPEN
    };

    // Create spies for WebSocket event handlers
    mockOnOpen = jest.fn();
    mockOnMessage = jest.fn();
    mockOnClose = jest.fn();
    mockOnError = jest.fn();

    // Mock WebSocket constructor
    global.WebSocket = jest.fn().mockImplementation(() => {
      mockWebSocket.onopen = mockOnOpen;
      mockWebSocket.onmessage = mockOnMessage;
      mockWebSocket.onclose = mockOnClose;
      mockWebSocket.onerror = mockOnError;
      return mockWebSocket;
    });

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should connect to WebSocket server', () => {
    wsService.connect();
    expect(global.WebSocket).toHaveBeenCalledWith('ws://localhost:3001');
  });

  it('should handle successful connection', () => {
    wsService.connect();
    const onOpenEvent = new Event('open');
    mockWebSocket.onopen(onOpenEvent);
    expect(mockOnOpen).toHaveBeenCalled();
  });

  it('should handle incoming messages', (done) => {
    const testMessage: WebSocketMessage = {
      type: 'metrics',
      data: { totalSent: 100 }
    };

    wsService.connect();
    wsService.messages$.subscribe((message) => {
      expect(message).toEqual(testMessage);
      done();
    });

    const messageEvent = new MessageEvent('message', {
      data: JSON.stringify(testMessage)
    });
    mockWebSocket.onmessage(messageEvent);
  });

  it('should handle connection errors', (done) => {
    wsService.connect();
    wsService.messages$.subscribe((message) => {
      expect(message.type).toBe('error');
      expect(message.data).toBe('Connection error occurred');
      done();
    });

    const errorEvent = new Event('error');
    mockWebSocket.onerror(errorEvent);
  });

  it('should attempt to reconnect on connection close', () => {
    jest.useFakeTimers();
    wsService.connect();

    const closeEvent = new CloseEvent('close');
    mockWebSocket.onclose(closeEvent);

    // Fast-forward time to trigger reconnection
    jest.advanceTimersByTime(1000);

    expect(global.WebSocket).toHaveBeenCalledTimes(2);
    jest.useRealTimers();
  });

  it('should send messages when connected', () => {
    const testMessage = { type: 'metrics', data: { totalSent: 100 } };
    wsService.connect();
    wsService.send(testMessage);
    expect(mockWebSocket.send).toHaveBeenCalledWith(JSON.stringify(testMessage));
  });

  it('should not send messages when disconnected', () => {
    const testMessage = { type: 'metrics', data: { totalSent: 100 } };
    mockWebSocket.readyState = WebSocket.CLOSED;
    wsService.connect();
    wsService.send(testMessage);
    expect(mockWebSocket.send).not.toHaveBeenCalled();
  });

  it('should disconnect properly', () => {
    wsService.connect();
    wsService.disconnect();
    expect(mockWebSocket.close).toHaveBeenCalled();
  });

  it('should handle malformed messages', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    wsService.connect();

    const messageEvent = new MessageEvent('message', {
      data: 'invalid json'
    });
    mockWebSocket.onmessage(messageEvent);

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
}); 