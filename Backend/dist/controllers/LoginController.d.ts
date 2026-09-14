import { Request, Response } from 'express';
import { IController } from '../interfaces/IController';
import { IAuthService } from '../interfaces/IAuthService';
export declare class LoginController implements IController {
    private readonly authService;
    constructor(authService: IAuthService);
    handle(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=LoginController.d.ts.map