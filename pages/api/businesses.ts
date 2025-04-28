import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../lib/supabase'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case 'GET':
      return getBusinesses(req, res)
    case 'POST':
      return createBusiness(req, res)
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
  }
}

async function getBusinesses(req: NextApiRequest, res: NextApiResponse) {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  return res.status(200).json(data)
}

async function createBusiness(req: NextApiRequest, res: NextApiResponse) {
  const businessData = req.body

  const { data, error } = await supabase
    .from('businesses')
    .insert(businessData)
    .select()

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  return res.status(201).json(data)
}
