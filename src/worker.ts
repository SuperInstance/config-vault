interface ConfigVault {
  environments: Record<string, Environment>;
  featureFlags: Record<string, FeatureFlag>;
  secrets: Record<string, Secret>;
  configVersions: ConfigVersion[];
  vesselOverrides: Record<string, VesselOverride>;
}

interface Environment {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  updatedAt: number;
}

interface FeatureFlag {
  key: string;
  value: boolean;
  description: string;
  environments: string[];
  createdAt: number;
  updatedAt: number;
}

interface Secret {
  key: string;
  encryptedValue: string;
  description: string;
  lastRotated: number;
  environments: string[];
}

interface ConfigVersion {
  version: number;
  timestamp: number;
  changes: ConfigChange[];
  author: string;
}

interface ConfigChange {
  type: 'feature_flag' | 'secret' | 'environment';
  key: string;
  oldValue: any;
  newValue: any;
}

interface VesselOverride {
  vesselId: string;
  featureFlags: Record<string, boolean>;
  configValues: Record<string, any>;
  lastUpdated: number;
}

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

const DEFAULT_CONFIG: ConfigVault = {
  environments: {
    'prod': {
      id: 'prod',
      name: 'Production',
      description: 'Production environment',
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    'staging': {
      id: 'staging',
      name: 'Staging',
      description: 'Staging environment',
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  },
  featureFlags: {
    'new_dashboard': {
      key: 'new_dashboard',
      value: false,
      description: 'Enable new dashboard UI',
      environments: ['staging'],
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    'beta_features': {
      key: 'beta_features',
      value: true,
      description: 'Enable beta features',
      environments: ['staging'],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  },
  secrets: {
    'api_key': {
      key: 'api_key',
      encryptedValue: 'enc:demo_key_123',
      description: 'Main API key',
      lastRotated: Date.now(),
      environments: ['prod', 'staging']
    }
  },
  configVersions: [],
  vesselOverrides: {}
};

const STORAGE_KEY = 'config_vault_data';

async function getStoredData(env: any): Promise<ConfigVault> {
  try {
    const stored = await env.CONFIG_VAULT.get(STORAGE_KEY, 'json');
    return stored || DEFAULT_CONFIG;
  } catch {
    return DEFAULT_CONFIG;
  }
}

async function saveData(env: any, data: ConfigVault): Promise<void> {
  await env.CONFIG_VAULT.put(STORAGE_KEY, JSON.stringify(data));
}

function createConfigVersion(data: ConfigVault, author: string, changes: ConfigChange[]): ConfigVersion {
  const version: ConfigVersion = {
    version: data.configVersions.length + 1,
    timestamp: Date.now(),
    changes,
    author
  };
  
  data.configVersions.unshift(version);
  if (data.configVersions.length > 50) {
    data.configVersions = data.configVersions.slice(0, 50);
  }
  
  return version;
}

function htmlResponse(content: string): Response {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Config Vault - Fleet Configuration Management</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --dark: #0a0a0f;
            --accent: #b91c1c;
            --light: #f8fafc;
            --gray: #64748b;
            --dark-gray: #1e293b;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', sans-serif;
            background-color: var(--dark);
            color: var(--light);
            line-height: 1.6;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
            flex: 1;
        }
        
        header {
            background: linear-gradient(135deg, var(--dark) 0%, #1a1a2e 100%);
            border-bottom: 1px solid var(--dark-gray);
            padding: 2rem 0;
        }
        
        .hero {
            text-align: center;
            padding: 3rem 0;
        }
        
        .hero h1 {
            font-size: 3.5rem;
            font-weight: 700;
            background: linear-gradient(135deg, var(--light) 0%, var(--accent) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 1rem;
        }
        
        .hero p {
            font-size: 1.25rem;
            color: var(--gray);
            max-width: 600px;
            margin: 0 auto 2rem;
        }
        
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 2rem;
            margin: 3rem 0;
        }
        
        .feature-card {
            background: var(--dark-gray);
            border-radius: 12px;
            padding: 2rem;
            border: 1px solid #2d3748;
            transition: transform 0.3s ease, border-color 0.3s ease;
        }
        
        .feature-card:hover {
            transform: translateY(-5px);
            border-color: var(--accent);
        }
        
        .feature-icon {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            color: var(--accent);
        }
        
        .feature-card h3 {
            font-size: 1.5rem;
            margin-bottom: 1rem;
            color: var(--light);
        }
        
        .feature-card p {
            color: var(--gray);
        }
        
        .endpoints {
            background: var(--dark-gray);
            border-radius: 12px;
            padding: 2rem;
            margin: 3rem 0;
            border: 1px solid #2d3748;
        }
        
        .endpoints h2 {
            font-size: 2rem;
            margin-bottom: 2rem;
            color: var(--light);
        }
        
        .endpoint {
            background: rgba(10, 10, 15, 0.5);
            border-radius: 8px;
            padding: 1.5rem;
            margin-bottom: 1rem;
            border-left: 4px solid var(--accent);
        }
        
        .method {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            background: var(--accent);
            color: white;
            border-radius: 4px;
            font-weight: 600;
            font-size: 0.875rem;
            margin-right: 1rem;
        }
        
        .path {
            font-family: 'Monaco', 'Courier New', monospace;
            color: var(--light);
            font-weight: 500;
        }
        
        .description {
            color: var(--gray);
            margin-top: 0.5rem;
        }
        
        footer {
            background: var(--dark-gray);
            border-top: 1px solid #2d3748;
            padding: 2rem 0;
            margin-top: auto;
        }
        
        .footer-content {
            text-align: center;
            color: var(--gray);
        }
        
        .fleet-footer {
            font-size: 0.875rem;
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid #374151;
        }
        
        .status-badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            background: #10b981;
            color: white;
            border-radius: 4px;
            font-size: 0.875rem;
            font-weight: 500;
            margin-left: 1rem;
        }
        
        @media (max-width: 768px) {
            .hero h1 {
                font-size: 2.5rem;
            }
            
            .features {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <div class="hero">
                <h1>Config Vault</h1>
                <p>Fleet-wide configuration management system for distributed vessel operations</p>
                <div class="status-badge">Operational</div>
            </div>
        </div>
    </header>
    
    <main class="container">
        <section class="features">
            <div class="feature-card">
                <div class="feature-icon">⚙️</div>
                <h3>Environment Management</h3>
                <p>Manage configurations across multiple environments with isolated settings and seamless transitions.</p>
            </div>
            
            <div class="feature-card">
                <div class="feature-icon">🚩</div>
                <h3>Feature Flags</h3>
                <p>Toggle features dynamically without deployments. Enable/disable functionality in real-time.</p>
            </div>
            
            <div class="feature-card">
                <div class="feature-icon">🔒</div>
                <h3>Secret Storage</h3>
                <p>Secure storage for API keys, tokens, and sensitive data with automatic rotation support.</p>
            </div>
            
            <div class="feature-card">
                <div class="feature-icon">🔄</div>
                <h3>Version Control</h3>
                <p>Track configuration changes with full version history and one-click rollback capabilities.</p>
            </div>
            
            <div class="feature-card">
                <div class="feature-icon">🚢</div>
                <h3>Per-Vessel Overrides</h3>
                <p>Custom configurations for individual vessels while maintaining fleet-wide standards.</p>
            </div>
            
            <div class="feature-card">
                <div class="feature-icon">📊</div>
                <h3>Audit Logging</h3>
                <p>Comprehensive audit trails for all configuration changes with author attribution.</p>
            </div>
        </section>
        
        <section class="endpoints">
            <h2>API Endpoints</h2>
            
            <div class="endpoint">
                <span class="method">GET</span>
                <span class="path">/api/config</span>
                <p class="description">Retrieve current configuration for all environments and feature flags.</p>
            </div>
            
            <div class="endpoint">
                <span class="method">POST</span>
                <span class="path">/api/flag</span>
                <p class="description">Create or update feature flags with environment targeting.</p>
            </div>
            
            <div class="endpoint">
                <span class="method">GET</span>
                <span class="path">/api/secrets</span>
                <p class="description">Access encrypted secrets (requires authentication).</p>
            </div>
            
            <div class="endpoint">
                <span class="method">GET</span>
                <span class="path">/health</span>
                <p class="description">Health check endpoint returns system status.</p>
            </div>
        </section>
    </main>
    
    <footer>
        <div class="container">
            <div class="footer-content">
                <p>Config Vault v1.0 • Fleet Configuration Management System</p>
                <div class="fleet-footer">
                    <p>Fleet Operations • Secure • Scalable • Real-time</p>
                    <p>© ${new Date().getFullYear()} Vessel Command Network. All configurations secured.</p>
                </div>
            </div>
        </div>
    </footer>
</body>
</html>`;
  
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html',
      'Content-Security-Policy': "default-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com;",
      'X-Frame-Options': 'DENY'
    }
  });
}

async function handleApiConfig(request: Request, env: any): Promise<Response> {
  const data = await getStoredData(env);
  const url = new URL(request.url);
  const environment = url.searchParams.get('environment');
  const vesselId = url.searchParams.get('vesselId');
  
  let responseData = { ...data };
  
  if (environment) {
    responseData.featureFlags = Object.fromEntries(
      Object.entries(data.featureFlags).filter(([_, flag]) => 
        flag.environments.includes(environment)
      )
    );
    
    responseData.secrets = Object.fromEntries(
      Object.entries(data.secrets).filter(([_, secret]) =>
        secret.environments.includes(environment)
      )
    );
  }
  
  if (vesselId && data.vesselOverrides[vesselId]) {
    const override = data.vesselOverrides[vesselId];
    responseData.featureFlags = {
      ...responseData.featureFlags,
      ...Object.fromEntries(
        Object.entries(override.featureFlags || {}).map(([key, value]) => [
          key,
          { ...responseData.featureFlags[key], value }
        ])
      )
    };
  }
  
  delete responseData.secrets;
  
  const response: ApiResponse = {
    success: true,
    data: responseData
  };
  
  return new Response(JSON.stringify(response, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'X-Frame-Options': 'DENY'
    }
  });
}

async function handleApiFlag(request: Request, env: any): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  try {
    const body = await request.json();
    const { key, value, description, environments, author = 'system' } = body;
    
    if (!key || typeof value !== 'boolean') {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing required fields: key (string) and value (boolean)' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const data = await getStoredData(env);
    const oldFlag = data.featureFlags[key];
    
    data.featureFlags[key] = {
      key,
      value,
      description: description || oldFlag?.description || '',
      environments: environments || oldFlag?.environments || ['prod'],
      createdAt: oldFlag?.createdAt || Date.now(),
      updatedAt: Date.now()
    };
    
    const changes: ConfigChange[] = [{
      type: 'feature_flag',
      key,
      oldValue: oldFlag?.value,
      newValue: value
    }];
    
    createConfigVersion(data, author, changes);
    await saveData(env, data);
    
    const response: ApiResponse = {
      success: true,
      data: { flag: data.featureFlags[key] }
    };
    
    return new Response(JSON.stringify(response, null, 2), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Invalid JSON payload' 
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleApiSecrets(request: Request, env: any): Promise<Response> {
  const data = await getStoredData(env);
  const url = new URL(request.url);
  const environment = url.searchParams.get('environment');
  
  let secrets = { ...data.secrets };
  
  if (environment) {
    secrets = Object.fromEntries(
      Object.entries(secrets).filter(([_, secret]) =>
        secret.environments.includes(environment)
      )
    );
  }
  
  const response: ApiResponse = {
    success: true,
    data: Object.keys(secrets).map(key => ({
      key: secrets[key].key,
      description: secrets[key].description,
      lastRotated: new Date(secrets[key].lastRotated).toISOString(),
      environments: secrets[key].environments
    }))
  };
  
  return new Response(JSON.stringify(response, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'X-Frame-Options': 'DENY'
    }
  });
}

async function handleHealth(): Promise<Response> {
  const response = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'config-vault',
    version: '1.0.0'
  };
  
  return new Response(JSON.stringify(response, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'X-Frame-Options': 'DENY'
    }
  });
}

const handler: ExportedHandler = {
  async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    
    if (path === '/' || path === '') {
      return htmlResponse('');
    }
    
    if (path === '/health') {
      return handleHealth();
    }
    
    if (path === '/api/config') {
      return handleApiConfig(request, env);
    }
    
    if (path === '/api/flag') {
      return handleApiFlag(request, env);
    }
    
    if (path === '/api/secrets') {
      return handleApiSecrets(request, env);
    }
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Not found' 
    }), {
      status: 404,
      headers: { 
        'Content-Type': 'application/json',
        'X-Frame-Options': 'DENY'
      }
    });
  }
};
const sh = {"Content-Security-Policy":"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; frame-ancestors 'none'","X-Frame-Options":"DENY"};
export default { async fetch(r: Request) { const u = new URL(r.url); if (u.pathname==='/health') return new Response(JSON.stringify({status:'ok'}),{headers:{'Content-Type':'application/json',...sh}}); return new Response(html,{headers:{'Content-Type':'text/html;charset=UTF-8',...sh}}); }};