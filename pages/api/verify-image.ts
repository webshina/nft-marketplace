import { FileReq } from '@_types/nft';
import axios from 'axios';
import FormData from 'form-data';
import { NextApiRequest, NextApiResponse } from 'next';
import { Session } from 'next-iron-session';
import { v4 as uuidv4 } from 'uuid';
import {
  addressCheckMiddleware,
  pinataApiKey,
  pinataSecretApiKey,
  withSession,
} from './utils';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
  },
};
export default withSession(
  async (req: NextApiRequest & { session: Session }, res: NextApiResponse) => {
    if (req.method === 'POST') {
      try {
        const { bytes, fileName, contentType } = req.body as FileReq;

        if (!bytes || !fileName || !contentType) {
          return res.status(422).send({ message: 'Invalid data are missing' });
        }

        await addressCheckMiddleware(req, res);
        const buffer = Buffer.from(Object.values(bytes));

        const formData = new FormData();
        formData.append('file', buffer, {
          contentType,
          filename: fileName + '-' + uuidv4(),
        });

        const fileRes = await axios.post(
          'https://api.pinata.cloud/pinning/pinFileToIPFS',
          formData,
          {
            maxBodyLength: Infinity,
            headers: {
              'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`,
              pinata_api_key: pinataApiKey,
              pinata_secret_api_key: pinataSecretApiKey,
            },
          }
        );

        return res.status(200).send(fileRes.data);
      } catch (e) {
        console.log(e);
      }
    } else if (req.method === 'GET') {
      try {
      } catch {}
    } else {
      return res.status(422).json({ message: 'Invalid endpoint' });
    }
  }
);
