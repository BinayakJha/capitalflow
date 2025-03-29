import { 
  users, 
  workspaces, 
  transformations, 
  visualizations,
  type User, 
  type InsertUser,
  type Workspace,
  type InsertWorkspace,
  type Transformation,
  type InsertTransformation,
  type Visualization,
  type InsertVisualization
} from "@shared/schema";

// Storage interface definition
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  
  // Workspace methods
  getWorkspace(id: number): Promise<Workspace | undefined>;
  getWorkspacesByUserId(userId: number): Promise<Workspace[]>;
  createWorkspace(workspace: InsertWorkspace): Promise<Workspace>;
  updateWorkspace(id: number, workspaceData: Partial<Workspace>): Promise<Workspace | undefined>;
  deleteWorkspace(id: number): Promise<boolean>;
  
  // Transformation methods
  getTransformationsByWorkspaceId(workspaceId: number): Promise<Transformation[]>;
  createTransformation(transformation: InsertTransformation): Promise<Transformation>;
  
  // Visualization methods
  getVisualizationsByWorkspaceId(workspaceId: number): Promise<Visualization[]>;
  createVisualization(visualization: InsertVisualization): Promise<Visualization>;
  updateVisualization(id: number, visualizationData: Partial<Visualization>): Promise<Visualization | undefined>;
  deleteVisualization(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private workspaces: Map<number, Workspace>;
  private transformations: Map<number, Transformation>;
  private visualizations: Map<number, Visualization>;
  private userId: number;
  private workspaceId: number;
  private transformationId: number;
  private visualizationId: number;

  constructor() {
    this.users = new Map();
    this.workspaces = new Map();
    this.transformations = new Map();
    this.visualizations = new Map();
    this.userId = 1;
    this.workspaceId = 1;
    this.transformationId = 1;
    this.visualizationId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.firebaseUid === firebaseUid,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Workspace methods
  async getWorkspace(id: number): Promise<Workspace | undefined> {
    return this.workspaces.get(id);
  }

  async getWorkspacesByUserId(userId: number): Promise<Workspace[]> {
    return Array.from(this.workspaces.values()).filter(
      (workspace) => workspace.userId === userId,
    );
  }

  async createWorkspace(insertWorkspace: InsertWorkspace): Promise<Workspace> {
    const id = this.workspaceId++;
    const createdAt = new Date();
    const updatedAt = new Date();
    const workspace: Workspace = { ...insertWorkspace, id, createdAt, updatedAt };
    this.workspaces.set(id, workspace);
    return workspace;
  }

  async updateWorkspace(id: number, workspaceData: Partial<Workspace>): Promise<Workspace | undefined> {
    const workspace = await this.getWorkspace(id);
    if (!workspace) return undefined;
    
    const updatedWorkspace = { 
      ...workspace, 
      ...workspaceData,
      updatedAt: new Date()
    };
    this.workspaces.set(id, updatedWorkspace);
    return updatedWorkspace;
  }

  async deleteWorkspace(id: number): Promise<boolean> {
    return this.workspaces.delete(id);
  }

  // Transformation methods
  async getTransformationsByWorkspaceId(workspaceId: number): Promise<Transformation[]> {
    return Array.from(this.transformations.values()).filter(
      (transformation) => transformation.workspaceId === workspaceId,
    );
  }

  async createTransformation(insertTransformation: InsertTransformation): Promise<Transformation> {
    const id = this.transformationId++;
    const timestamp = new Date();
    const transformation: Transformation = { ...insertTransformation, id, timestamp };
    this.transformations.set(id, transformation);
    return transformation;
  }

  // Visualization methods
  async getVisualizationsByWorkspaceId(workspaceId: number): Promise<Visualization[]> {
    return Array.from(this.visualizations.values()).filter(
      (visualization) => visualization.workspaceId === workspaceId,
    );
  }

  async createVisualization(insertVisualization: InsertVisualization): Promise<Visualization> {
    const id = this.visualizationId++;
    const createdAt = new Date();
    const visualization: Visualization = { ...insertVisualization, id, createdAt };
    this.visualizations.set(id, visualization);
    return visualization;
  }

  async updateVisualization(id: number, visualizationData: Partial<Visualization>): Promise<Visualization | undefined> {
    const visualization = await this.getVisualization(id);
    if (!visualization) return undefined;
    
    const updatedVisualization = { ...visualization, ...visualizationData };
    this.visualizations.set(id, updatedVisualization);
    return updatedVisualization;
  }

  async deleteVisualization(id: number): Promise<boolean> {
    return this.visualizations.delete(id);
  }

  // Helper method
  private async getVisualization(id: number): Promise<Visualization | undefined> {
    return this.visualizations.get(id);
  }
}

export const storage = new MemStorage();
