import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { TokenService } from '../services/token.service';

/**
 * authInterceptor: ดักจับ HTTP Request เพื่อแนบ Authorization Header (JWT Token) 
 * ส่งไปยัง API Backend โดยอัตโนมัติ
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const token = tokenService.getToken();
  
  if (token) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(authReq);
  }
  return next(req);
};
