import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create test users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: 'example_password_hash', // In production, use proper password hashing
    },
  })

  const organizer = await prisma.user.upsert({
    where: { email: 'organizer@example.com' },
    update: {},
    create: {
      email: 'organizer@example.com',
      name: 'Event Organizer',
      password: 'example_password_hash',
    },
  })

  const voter = await prisma.user.upsert({
    where: { email: 'voter@example.com' },
    update: {},
    create: {
      email: 'voter@example.com',
      name: 'Test Voter',
      password: 'example_password_hash',
    },
  })

  // Create test campaign
  const campaign = await prisma.campaign.create({
    data: {
      title: 'Ghana Music Awards 2024',
      description: 'The biggest music awards ceremony in Ghana',
      coverImage: 'https://example.com/cover1.jpg',
      organizerId: organizer.id,
    },
  })

  // Create categories
  const bestArtist = await prisma.category.create({
    data: {
      name: 'Best Artist of the Year',
      campaignId: campaign.id,
    },
  })

  const bestSong = await prisma.category.create({
    data: {
      name: 'Best Song of the Year',
      campaignId: campaign.id,
    },
  })

  const bestAlbum = await prisma.category.create({
    data: {
      name: 'Best Album of the Year',
      campaignId: campaign.id,
    },
  })

  // Create nominees
  const nominee1 = await prisma.nominee.create({
    data: {
      name: 'Sarkodie',
      bio: 'Ghanaian rapper and entrepreneur',
      image: 'https://example.com/sarkodie.jpg',
      categoryId: bestArtist.id,
      campaignId: campaign.id,
    },
  })

  const nominee2 = await prisma.nominee.create({
    data: {
      name: 'Shatta Wale',
      bio: 'Ghanaian dancehall artist',
      image: 'https://example.com/shatta.jpg',
      categoryId: bestArtist.id,
      campaignId: campaign.id,
    },
  })

  const nominee3 = await prisma.nominee.create({
    data: {
      name: 'Stonebwoy',
      bio: 'Ghanaian dancehall and reggae artist',
      image: 'https://example.com/stonebwoy.jpg',
      categoryId: bestArtist.id,
      campaignId: campaign.id,
    },
  })

  console.log('✅ Database seeded successfully!')
  console.log('👥 Users created:', { admin: admin.id, organizer: organizer.id, voter: voter.id })
  console.log('🎭 Campaign created:', campaign.id)
  console.log('🏆 Categories created:', { bestArtist: bestArtist.id, bestSong: bestSong.id, bestAlbum: bestAlbum.id })
  console.log('👤 Nominees created:', { nominee1: nominee1.id, nominee2: nominee2.id, nominee3: nominee3.id })
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
