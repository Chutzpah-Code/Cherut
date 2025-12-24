// RESET COMPLETO DO RATE LIMITING
console.log('🔥 RESET COMPLETO INICIADO');
console.log('========================');

// 1. Limpar TODOS os dados do localStorage
function clearAllLocalStorage() {
  console.log('🧹 Limpando localStorage completo...');

  // Mostrar o que tinha antes
  console.log('📦 Dados antes da limpeza:');
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.includes('rate_limit')) {
      console.log(`  - ${key}:`, localStorage.getItem(key));
    }
  }

  // Limpar tudo relacionado ao rate limiting
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('rate_limit') || key.includes('client_fingerprint'))) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`✅ Removido: ${key}`);
  });

  console.log(`🎯 Total removido: ${keysToRemove.length} itens`);
}

// 2. Verificar se realmente foi limpo
function verifyClean() {
  console.log('\n🔍 Verificando limpeza...');
  let found = false;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('rate_limit') || key.includes('client_fingerprint'))) {
      console.log(`❌ AINDA EXISTE: ${key}`);
      found = true;
    }
  }

  if (!found) {
    console.log('✨ localStorage está limpo!');
  }

  return !found;
}

// 3. Forçar refresh da página
function forceRefresh() {
  console.log('\n🔄 Forçando refresh da página...');
  setTimeout(() => {
    window.location.reload(true);
  }, 1000);
}

// 4. Executar reset completo
function resetEverything() {
  console.log('🚀 EXECUTANDO RESET COMPLETO...');
  clearAllLocalStorage();
  const isClean = verifyClean();

  if (isClean) {
    console.log('✅ Reset bem sucedido!');
    forceRefresh();
  } else {
    console.log('❌ Ainda há dados. Tentando novamente...');
    localStorage.clear(); // Força limpeza total
    forceRefresh();
  }
}

// Disponibilizar globalmente
window.resetEverything = resetEverything;
window.clearAllLocalStorage = clearAllLocalStorage;
window.verifyClean = verifyClean;

console.log('\n🛠️ Comandos disponíveis:');
console.log('- resetEverything() - Reset completo + refresh');
console.log('- clearAllLocalStorage() - Limpar apenas dados');
console.log('- verifyClean() - Verificar se está limpo');

console.log('\n🚨 EXECUTE: resetEverything()');