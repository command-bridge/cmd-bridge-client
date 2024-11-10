import Store from 'electron-store';

// Configurando o electron-store com criptografia
export type CommandBridgeClientStore = {
  access_token?: string,
  auto_startup: boolean,
}
const store = new Store<CommandBridgeClientStore>({ 
  encryptionKey: 'chave-secreta-segura',
  defaults: {
    access_token: '',
    auto_startup: true
  }
});

// Função para salvar o token de autenticação
export function setAccessToken(token: string) {
  store.set('access_token', token);

  console.log('Updated store', store.store);
}

// Função para recuperar o token de autenticação
export function getAccessToken() {
  return store.get('access_token');
}

export function getAllSettings() {

  return store.store;
}

export function resetSettings() {

  store.clear();
}

console.log('Loaded store', store.store);