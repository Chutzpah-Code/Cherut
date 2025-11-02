// Debug logger - captura todos os logs do console e persiste no localStorage
(function() {
  // Carregar logs anteriores do localStorage
  let logs = [];
  try {
    const saved = localStorage.getItem('debug-logs');
    if (saved) {
      logs = JSON.parse(saved);
    }
  } catch (e) {
    // Ignore
  }

  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;

  function saveLogs() {
    try {
      // Manter apenas os últimos 200 logs
      const recentLogs = logs.slice(-200);
      localStorage.setItem('debug-logs', JSON.stringify(recentLogs));
    } catch (e) {
      // Ignore
    }
  }

  console.log = function(...args) {
    const logEntry = {
      type: 'log',
      time: new Date().toISOString(),
      args: args.map(arg => {
        try {
          return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
        } catch {
          return String(arg);
        }
      })
    };
    logs.push(logEntry);
    saveLogs();
    originalLog.apply(console, args);
  };

  console.error = function(...args) {
    const logEntry = {
      type: 'error',
      time: new Date().toISOString(),
      args: args.map(arg => {
        try {
          return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
        } catch {
          return String(arg);
        }
      })
    };
    logs.push(logEntry);
    saveLogs();
    originalError.apply(console, args);
  };

  console.warn = function(...args) {
    const logEntry = {
      type: 'warn',
      time: new Date().toISOString(),
      args: args.map(arg => {
        try {
          return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
        } catch {
          return String(arg);
        }
      })
    };
    logs.push(logEntry);
    saveLogs();
    originalWarn.apply(console, args);
  };

  // Função para baixar os logs
  window.downloadLogs = function() {
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'console-logs-' + Date.now() + '.json';
    a.click();
  };

  // Função para ver os últimos logs
  window.showLogs = function(count = 50) {
    const recent = logs.slice(-count);
    recent.forEach(log => {
      const style = log.type === 'error' ? 'color: red' : log.type === 'warn' ? 'color: orange' : 'color: white';
      originalLog(`%c[${log.type.toUpperCase()}] ${log.time}`, style, ...log.args);
    });
    originalLog(`\n📊 Total de logs: ${logs.length}`);
  };

  // Função para limpar logs
  window.clearLogs = function() {
    logs = [];
    localStorage.removeItem('debug-logs');
    originalLog('✅ Logs limpos!');
  };

  originalLog('🔍 Debug logger ativado! Comandos disponíveis:');
  originalLog('  - window.showLogs(50) - Mostra últimos 50 logs');
  originalLog('  - window.downloadLogs() - Baixa logs em JSON');
  originalLog('  - window.clearLogs() - Limpa todos os logs');
  originalLog(`📊 Logs existentes: ${logs.length}`);
})();
