import { Router, Request, Response } from 'express';
export let router = Router();
import * as unifiedorder from '@api/pay/unifiedorder';

router.get('/unifiedorder', unifiedorder.GetHandler());