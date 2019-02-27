import { Router, Request, Response } from 'express';
export let router = Router();
import * as unifiedorder from '@api/pay/unifiedorder';
import * as notify from '@api/pay/notify';

router.get('/unifiedorder', unifiedorder.GetHandler());

router.post('/notify', notify.PostHandler());