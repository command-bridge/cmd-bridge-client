import Store from 'electron-store';

// Configurando o electron-store com criptografia
export type CommandBridgeClientStore = {
  access_token?: string
}
const store = new Store<CommandBridgeClientStore>({ 
  encryptionKey: 'chave-secreta-segura',
  defaults: {
    access_token: ''
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

console.log('Loaded store', store.store);